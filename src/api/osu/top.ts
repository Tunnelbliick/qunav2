import { login } from "./login";
import { v2 } from "osu-api-extended"
import { getBeatmapFromCache } from "./beatmap";
import { loadacc100WithoutBeatMapDownload } from "../pp/db/load100";
import { difficulty } from "../pp/difficulty";
import { getLeaderBoard } from "./leaderboard";
import asyncBatch from "async-batch";

export async function getTop(userid: any, offset?: any, limit?: any, mode?: any) {
    await login();
    const params: any = {};
    params.limit = 100;
    if (limit != undefined)
        params.limit = limit;
    if (offset != undefined)
        params.offset = offset;
    params.mode = 0;
    if (mode != undefined) {
        if (mode == "catch")
            mode = "fruits"
        params.mode = mode;
    }
    return new Promise((resolve, rejcet) => {
        v2.user.scores.category(userid, "best", params).then((data: any) => {
            return resolve(data)
        });
    });
}

export async function getTopForUser(userid: string, offset?: number, limit?: number, mode?: any) {

    const bestplays: any = await getTop(userid, offset, limit, mode);

    if (bestplays.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const returnArray: Array<Object> = [];

    if (bestplays == undefined) {
        return undefined;
    }

    bestplays.forEach((play: any, index: any) => {
        returnArray.push({ position: index, value: play });
    })

    return returnArray;
}

export async function getNoChockeForUser(userid: string, offset?: number, limit?: number, mode?: any) {

    const bestplays: any = await getTop(userid, offset, limit, mode);

    if (bestplays.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const returnArray: Array<Object> = [];
    const beatmapMap: Map<number, number> = new Map<number, number>();

    if (bestplays == undefined) {
        return null;
    }

    // Load beatmaps in parallel to speed this up in the ideal case all beatmaps will be loaded from local instead of osu
    await asyncBatch(bestplays,
        (task: any) => new Promise(
            async (resolve) => {
                const beatmap: any = await getBeatmapFromCache(task.beatmap.id, task.beatmap.checksum);
                beatmapMap.set(beatmap.id, beatmap.max_combo);
                resolve(true);
            }
        ),
        10,
    );

    bestplays.forEach((play: any, index: any) => {
        returnArray.push({ position: index, value: play, max_combo: beatmapMap.get(play.beatmap.id) });
    })

    return returnArray;
}


export async function getMaxForCurrentTopArray(input: any) {

    return new Promise(async (resolve, reject) => {

        const beatmap: any = getBeatmapFromCache(input.value.beatmap.id, input.value.beatmap.checksum);
        const acc100: any = loadacc100WithoutBeatMapDownload(input.value.beatmap.id, input.value.beatmap.checksum, input.value.mods, input.value.beatmap.mode);
        const raiting: any = difficulty(input.value.beatmap.id, input.value.beatmap.checksum, input.value.mode, input.value.mods);

        acc100.catch(() => { return reject(null); });

        Promise.allSettled([beatmap, acc100, raiting]).then((result: any) => {


            return resolve({
                position: input.position,
                value: input.value,
                beatmap: result[0],
                maxpp: result[1],
                difficulty: result[2]
            });

        }).catch((error) => {
            console.log(error);
            return reject(error);
        })
    })

}

export async function getMaxForCurrentNoChockeArray(input: any) {

    return new Promise(async (resolve, reject) => {
        

        const beatmap: any = getBeatmapFromCache(input.play.beatmap.id, input.play.beatmap.checksum);
        const acc100: any = loadacc100WithoutBeatMapDownload(input.play.beatmap.id, input.play.beatmap.checksum, input.play.mods, input.play.beatmap.mode);
        const raiting: any = difficulty(input.play.beatmap.id, input.play.beatmap.checksum, input.play.mode, input.play.mods);

        acc100.catch(() => { return reject(null); });

        Promise.allSettled([beatmap, acc100, raiting]).then((result: any) => {


            return resolve({
                position: input.position,
                value: input.play,
                unchocked: input.pp,
                beatmap: result[0],
                maxpp: result[1],
                difficulty: result[2]
            });

        }).catch((error) => {
            console.log(error);
            return reject(error);
        })
    })

}

