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


    let beatmap: any = await getBeatmap(mapid);
    let user: any = await getUserByUsername(username, beatmap.mode);
    let scoresPromise: any = getBeatmapScore(mapid, user.id, beatmap.mode);
    let top100Promise: any = getTopForUser(user.id, undefined, undefined, undefined);
    let leaderboardPromise: any = getLeaderBoard(mapid, undefined);
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

        let promises: Array<Promise<any>> = []

        scores.scores.forEach(async (score: any) => {

            let top100 = top.find((t: any) => t.value.id === score.best_id);

            let leaderboard = lb.find((t: any) => t.value.id === score.best_id);

            if (top100 !== undefined)
                top_100_position = top100.position;

            if (leaderboard !== undefined)
                leaderboard_position = leaderboard.position;

            let promise: Promise<any> = new Promise((resolve, reject) => {

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

    let scoresPromise: any = getBeatmapScore(mapid, userid)
    let beatmapPromise: any = getBeatmap(mapid);
    let top100: any = getTopForUser(userid, undefined, undefined, undefined);
    let leaderboard: any = getLeaderBoard(mapid, undefined);

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

        user = await getUser(userid, beatmap.mode);
    })

    if (scores.scores == undefined) {

        return { scores: scores.scores, user: user, beatmap: beatmap };

    }

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${beatmap.id}_${beatmap.checksum}.osu`, beatmap.id);

    return new Promise((resolve, reject) => {

        let promises: Array<Promise<any>> = []

        scores.scores.forEach(async (score: any) => {
            
            let top100 = top.find((t: any) => t.value.id === score.best_id);

            let leaderboard = lb.find((t: any) => t.value.id === score.best_id);

            if (top100 !== undefined)
                top_100_position = top100.position;

            if (leaderboard !== undefined)
                leaderboard_position = leaderboard.position;

            let promise: Promise<any> = new Promise(async (resolve, reject) => {

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

                let acc100: any = loadacc100(mapid, beatmap.checksum, score.mode, score.mods);
                let raiting: any = difficulty(mapid, beatmap.checksum, score.mode, score.mods);

                if (score.pp == null) {

                    let ppOfPlay: any = simulate(args);

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
