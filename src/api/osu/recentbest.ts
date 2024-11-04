import { login } from "./login";
import { v2 } from "osu-api-extended"

export async function getRecentBest(userid: any, offset?: any, mode?: any) {
    await login();
    const params: any = {};
    params.limit = 100;
    if (offset != undefined)
        params.offset = offset;
    if (mode != undefined) {
        if (mode == "catch")
            mode = "fruits"
        params.mode = mode;
    }
    return new Promise((resolve, rejcet) => {
        v2.scores.user.category(userid, "best", params).then((data: any) => {
            return resolve(data)
        });
    });
}

export async function getRecentBestForUser(userid: string, offset?: number, mode?: any) {

    const bestplays: any = await getRecentBest(userid, offset, mode);

    if (bestplays.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const returnArray: Array<Object> = [];

    if (bestplays == undefined) {
        return null;
    }

    bestplays.forEach((play: any, index: any) => {
        returnArray.push({ position: index, value: play });
    })

    return returnArray;
}