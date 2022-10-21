import { RecentPlayFilter } from "../../models/RecentPlayFilter";
import { difficulty } from "../pp/difficulty";
import { getBeatmapFromCache } from "./beatmap";
import { login } from "./login";
import { getUser, getUserByUsername } from "./user";
import { simulateRecentPlay, simulateRecentPlayFC } from "../pp/simulate"
import { downloadBeatmap } from "../beatmaps/downloadbeatmap";
import { loadacc100WithoutBeatMapDownload } from "../pp/db/load100";
import { calcRetries, filterRecent } from "./utility/utility";

import { v2 } from "osu-api-extended";
import { getTopForUser } from "./top";
import { getLeaderBoard } from "./leaderboard";

export async function getRecent(userid: any, include_fails?: number, limit?: number, mode?: string, offset?: number) {
    await login();
    const params: any = {};
    if (include_fails != undefined)
        params.include_fails = include_fails;
    if (limit != undefined)
        params.limit = limit;
    if (mode != undefined) {
        if (mode == "catch" || mode == "ctb")
            mode = "fruits"
        params.mode = mode;
    }
    if (offset != undefined)
        params.offset = offset;

    return new Promise((resolve, reject) => {
        const result = v2.user.scores.category(userid, "recent", params);

        result.then((data: any) => {
            return resolve(data);
        });
    });
}

export async function getRecentPlaysForUser(userid: string, filter: RecentPlayFilter, mode?: any) {
    let recentplays: any = await getRecent(userid, filter.include_fails, (50 - filter.offset), mode, filter.offset);

    // Check if osu API returns error
    if (recentplays.hasOwnProperty("error")) {
        return "osuapierr";
    }

    // Filter last 50 plays for a specific filter
    const filterFoundIndex = filterRecent(recentplays, filter);

    // Check if there are any results other wise return null
    if (filterFoundIndex == -1) {
        return null;
    }

    // Returns the first beatmap that matches the filter
    recentplays = recentplays.slice(filterFoundIndex);

    const recentplay = recentplays[0];
    const retries = calcRetries(recentplays, recentplay.beatmap.id, recentplay.mods);

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${recentplay.beatmap.id}_${recentplay.beatmap.checksum}.osu`, recentplay.beatmap.id);

    return new Promise(async (resolve, reject) => {

        const user: any = getUser(userid, recentplay.mode);
        const beatmap: any = await getBeatmapFromCache(recentplay.beatmap.id, recentplay.beatmap.checksum);
        const acc100: any = loadacc100WithoutBeatMapDownload(recentplay.beatmap.id, recentplay.beatmap.checksum, recentplay.mods, mode);
        const raiting: any = difficulty(recentplay.beatmap.id, recentplay.beatmap.checksum, mode, recentplay.mods);

        // is ranked
        if (recentplay.pp === null) {

            const ppOfPlay: any = simulateRecentPlay(recentplay);
            const ppIffc: any = simulateRecentPlayFC(recentplay, beatmap);

            Promise.allSettled([user, beatmap, acc100, ppOfPlay, ppIffc, raiting]).then((result: any) => {

                return resolve({
                    retries: retries,
                    recentplay: recentplay,
                    user: result[0].value,
                    beatmap: result[1].value,
                    acc100: result[2].value,
                    ppOfPlay: result[3].value,
                    ppIffc: result[4].value,
                    difficulty: result[5].value

                })
            });

        } else {

            const ppIffc = simulateRecentPlayFC(recentplay, beatmap);
            const top100: any = getTopForUser(userid, undefined, undefined, recentplay.mode);
            const leaderboard: any = getLeaderBoard(recentplay.beatmap.id, recentplay.mode);

            Promise.allSettled([user, beatmap, acc100, ppIffc, raiting, top100, leaderboard]).then((result: any) => {

                const top100 = result[5].value.find((t: any) => t.value.id === recentplay.best_id);
                let top_100_position = undefined;

                const leaderboard = result[6].value.find((t: any) => t.value.id === recentplay.best_id);
                let leaderboard_position = undefined;

                if (top100 !== undefined)
                    top_100_position = top100.position;

                if (leaderboard !== undefined)
                    leaderboard_position = leaderboard.position;

                return resolve({
                    retries: retries,
                    recentplay: recentplay,
                    user: result[0].value,
                    beatmap: result[1].value,
                    acc100: result[2].value,
                    ppIffc: result[3].value,
                    difficulty: result[4].value,
                    top100: top_100_position,
                    leaderboard: leaderboard_position
                })
            });
        }
    })
}

export async function getRecentPlaysForUserName(username: string, filter: RecentPlayFilter, mode?: any) {
    const user: any = await getUserByUsername(username, mode);

    if (user.hasOwnProperty("error")) {
        return "nouser";
    }

    let recentplays: any = await getRecent(user.id, filter.include_fails, (50 - filter.offset), mode, filter.offset);

    if (recentplays.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const filterFoundIndex = filterRecent(recentplays, filter);

    if (filterFoundIndex == -1) {
        return null;
    }

    recentplays = recentplays.slice(filterFoundIndex);

    const recentplay = recentplays[0];
    const retries = calcRetries(recentplays, recentplay.beatmap.id, recentplay.mods);

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${recentplay.beatmap.id}_${recentplay.beatmap.checksum}.osu`, recentplay.beatmap.id);

    return new Promise(async (resolve, reject) => {

        const beatmap: any = await getBeatmapFromCache(recentplay.beatmap.id, recentplay.beatmap.checksum);
        const acc100: any = loadacc100WithoutBeatMapDownload(recentplay.beatmap.id, recentplay.beatmap.checksum, recentplay.mods, mode);
        const raiting: any = difficulty(recentplay.beatmap.id, recentplay.beatmap.checksum, mode, recentplay.mods);

        if (recentplay.pp == null) {

            const ppOfPlay: any = simulateRecentPlay(recentplay);
            const ppIffc: any = simulateRecentPlayFC(recentplay, beatmap);

            Promise.allSettled([user, beatmap, acc100, ppOfPlay, ppIffc, raiting]).then((result: any) => {

                return resolve({
                    retries: retries,
                    recentplay: recentplay,
                    user: result[0].value,
                    beatmap: result[1].value,
                    acc100: result[2].value,
                    ppOfPlay: result[3].value,
                    ppIffc: result[4].value,
                    difficulty: result[5].value,
                })
            });

        } else {

            const ppIffc = simulateRecentPlayFC(recentplay, beatmap);
            const top100: any = getTopForUser(user.id, 0, 100, recentplay.mode);
            const leaderboard: any = getLeaderBoard(recentplay.beatmap.id, recentplay.mods);

            Promise.allSettled([user, beatmap, acc100, ppIffc, raiting, top100, leaderboard]).then((result: any) => {

                const top100 = result[5].value.find((t: any) => t.value.id === recentplay.best_id);
                let top_100_position = undefined;

                const leaderboard = result[6].value.find((t: any) => t.value.id === recentplay.best_id);
                let leaderboard_position = undefined;

                if (top100 !== undefined)
                    top_100_position = top100.position;

                if (leaderboard !== undefined)
                    leaderboard_position = leaderboard.position;

                return resolve({
                    retries: retries,
                    recentplay: recentplay,
                    user: result[0].value,
                    beatmap: result[1].value,
                    acc100: result[2].value,
                    ppIffc: result[3].value,
                    difficulty: result[4].value,
                    top100: top_100_position,
                    leaderboard: leaderboard_position
                })
            });
        }
    })
}