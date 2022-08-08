import { login } from "./login";
import { v2 } from "osu-api-extended"
import { getBeatmapFromCache } from "./beatmap";
import { loadacc100WithoutBeatMapDownload } from "../pp/db/load100";
import { difficulty } from "../pp/difficulty";
import { getLeaderBoard } from "./leaderboard";

export async function getTop(userid: any, offset?: any, limit?: any, mode?: any) {
    await login();
    let params: any = {};
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

    let bestplays: any = await getTop(userid, offset, limit, mode);

    if (bestplays.hasOwnProperty("error")) {
        return "osuapierr";
    }

    let returnArray: Array<Object> = [];

    if (bestplays == undefined) {
        return null;
    }

    bestplays.forEach((play: any, index: any) => {
        returnArray.push({ position: index, value: play });
    })

    return returnArray;
}

export async function getMaxForCurrentTopArray(input: any) {

    return new Promise(async (resolve, reject) => {

        let beatmap: any = getBeatmapFromCache(input.value.beatmap.id, input.value.beatmap.checksum);
        let acc100: any = loadacc100WithoutBeatMapDownload(input.value.beatmap.id, input.value.beatmap.checksum, input.value.mods, input.value.beatmap.mode);
        let raiting: any = difficulty(input.value.beatmap.id, input.value.beatmap.checksum, input.value.mode, input.value.mods);

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
            return reject(error); })
    })

}
