import { downloadBeatmap } from "../beatmaps/downloadbeatmap";
import { loadacc100 } from "../pp/db/load100";
import { difficulty } from "../pp/difficulty";
import { simulate, simulateArgs } from "../pp/simulate";
import { getBeatmap } from "./beatmap";
import { login } from "./login";
import { getUser, getUserByUsername } from "./user";
import { v2 } from "osu-api-extended"
import { getTopForUser } from "./top";
import { getLeaderBoard } from "./leaderboard";
import { loadUnrankedScore } from "../unranked/scoreLoading";


export async function getScore(mode: any, scoreid: any) {
    await login();
    return new Promise((resolve, reject) => {
        v2.scores.details(scoreid, mode).then((data: any) => {
            return resolve(data);
        });
    });
}

export async function getBeatmapScore(beatmap: any, userid: any, mode?: any) {
    await login();
    return new Promise((resolve, reject) => {
        if (mode === undefined) {
            v2.user.scores.beatmap.all(beatmap, userid).then((data: any) => {
                return resolve(data);
            });
        } else {
            v2.user.scores.beatmap.all(beatmap, userid, mode).then((data: any) => {
                return resolve(data);
            });
        }
    });
}

export async function getScoresForUsernameForBeatMap(mapid: string, username: any) {

    let scoresPromise: any
    const beatmap: any = await getBeatmap(mapid);
    const user: any = await getUserByUsername(username, beatmap.mode);
    if (["loved", "ranked", "qualified"].includes(beatmap.status)) {
        scoresPromise = getBeatmapScore(mapid, user.id, beatmap.mode);
    } else {
        scoresPromise = loadUnrankedScore(user.id, beatmap.id, beatmap.mode_int);
    }
    const top100Promise: any = getTopForUser(user.id, undefined, undefined, undefined);
    const leaderboardPromise: any = getLeaderBoard(mapid, undefined);
    let top: any;
    let lb: any;
    let scores: any;
    let top_100_position: any = undefined;
    let leaderboard_position: any = undefined;


    await Promise.allSettled([scoresPromise, top100Promise, leaderboardPromise]).then(async (result: any) => {

        scores = result[0].value;
        top = result[1].value;
        lb = result[2].value;
    })

    if (user.hasOwnProperty("error")) {
        return { scores: scores.scores, user: undefined, beatmap: beatmap };
    }

    if (scores.scores === undefined) {
        return { scores: undefined, user: user, beatmap: beatmap };
    }

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${beatmap.id}_${beatmap.checksum}.osu`, beatmap.id);

    return new Promise((resolve, reject) => {

        const promises: Array<Promise<any>> = []

        scores.scores.forEach(async (score: any) => {

            const top100 = top.find((t: any) => t.value.id === score.best_id);

            const leaderboard = lb.find((t: any) => t.value.id === score.best_id);

            if (top100 !== undefined)
                top_100_position = top100.position;

            if (leaderboard !== undefined)
                leaderboard_position = leaderboard.position;

            const promise: Promise<any> = new Promise((resolve, reject) => {

                const args: simulateArgs = {
                    mapid: mapid,
                    checksum: beatmap.checksum,
                    misses: score.statistics.count_miss,
                    mehs: score.statistics.count_50,
                    goods: score.statistics.count_100,
                    great: score.statistics.count_300,
                    combo: score.max_combo,
                    score: score.score,
                    mode: score.mode,
                    mods: score.mods
                };

                const acc100: any = loadacc100(mapid, beatmap.checksum, score.mode, score.mods);
                const raiting: any = difficulty(mapid, beatmap.checksum, score.mode, score.mods);

                if (score.pp == null) {

                    const ppOfPlay: any = simulate(args);

                    Promise.allSettled([acc100, ppOfPlay, raiting]).then((result: any) => {

                        return resolve({
                            score: score,
                            acc100: result[0].value,
                            ppOfPlay: result[1].value,
                            difficulty: result[2].value
                        })
                    });

                } else {

                    Promise.allSettled([acc100, raiting]).then((result: any) => {

                        return resolve({
                            score: score,
                            acc100: result[0].value,
                            difficulty: result[1].value
                        })
                    });
                }
            })

            promises.push(promise);
        })

        Promise.allSettled(promises).then((result: any) => {

            return resolve({
                scores: result,
                user: user,
                beatmap: beatmap,
                top: top_100_position,
                leaderboard: leaderboard_position,
            })
        });
    })
}

export async function getScoresForBeatMap(mapid: string, userid: string) {

    const scoresPromise: any = getBeatmapScore(mapid, userid)
    const beatmapPromise: any = getBeatmap(mapid);
    const top100: any = getTopForUser(userid, undefined, undefined, undefined);
    const leaderboard: any = getLeaderBoard(mapid, undefined);

    let scores: any;
    let beatmap: any;
    let top: any;
    let lb: any;
    let user: any;
    let top_100_position: any = undefined;
    let leaderboard_position: any = undefined;

    await Promise.allSettled([scoresPromise, beatmapPromise, top100, leaderboard]).then(async (result: any) => {

        scores = result[0].value;
        beatmap = result[1].value;
        top = result[2].value;
        lb = result[3].value;

        if(beatmap !== undefined && ["loved","ranked","qualified"].includes(beatmap.status) === false) {
            scores = await loadUnrankedScore(userid, beatmap.id, beatmap.mode_int)
        }

        user = await getUser(userid, beatmap.mode);
    })

    if (scores.scores == undefined) {

        return { scores: scores.scores, user: user, beatmap: beatmap };

    }

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${beatmap.id}_${beatmap.checksum}.osu`, beatmap.id);

    return new Promise((resolve, reject) => {

        const promises: Array<Promise<any>> = []

        scores.scores.forEach(async (score: any) => {

            const top100 = top.find((t: any) => t.value.id === score.best_id);

            const leaderboard = lb.find((t: any) => t.value.id === score.best_id);

            if (top100 !== undefined)
                top_100_position = top100.position;

            if (leaderboard !== undefined)
                leaderboard_position = leaderboard.position;

            const promise: Promise<any> = new Promise(async (resolve, reject) => {

                const args: simulateArgs = {
                    mapid: mapid,
                    checksum: beatmap.checksum,
                    misses: score.statistics.count_miss,
                    mehs: score.statistics.count_50,
                    goods: score.statistics.count_100,
                    great: score.statistics.count_300,
                    combo: score.max_combo,
                    score: score.score,
                    mode: score.mode,
                    mods: score.mods
                };

                const acc100: any = loadacc100(mapid, beatmap.checksum, score.mode, score.mods);
                const raiting: any = difficulty(mapid, beatmap.checksum, score.mode, score.mods);

                if (score.pp == null) {

                    const ppOfPlay: any = simulate(args);

                    Promise.allSettled([acc100, ppOfPlay, raiting]).then((result: any) => {

                        return resolve({
                            score: score,
                            acc100: result[0].value,
                            ppOfPlay: result[1].value,
                            difficulty: result[2].value
                        })
                    });

                } else {

                    Promise.allSettled([acc100, raiting]).then((result: any) => {

                        return resolve({
                            score: score,
                            acc100: result[0].value,
                            difficulty: result[1].value
                        })
                    });
                }
            })

            promises.push(promise);

        })

        Promise.allSettled(promises).then((result: any) => {

            return resolve({
                scores: result,
                user: user,
                beatmap: beatmap,
                top: top_100_position,
                leaderboard: leaderboard_position,
            })
        });
    })
}
