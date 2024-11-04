import { AnyComponentBuilder } from "@discordjs/builders"
import { v2 } from "osu-api-extended"
import { login } from "./login";


async function loadLeaderBoard(mapid: any, mode: any) {
    await login();
    return new Promise((resolve, reject) => {
        const result = v2.scores.beatmap(mapid, { mode: mode, type: "global" })

        result.then((data: any) => {
            resolve(data);
        })
    });

}


export async function getLeaderBoard(mapid: any, mode: any) {

    const leaderboard: any = await loadLeaderBoard(mapid, mode);

    if (leaderboard.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const leaderboardArray: Array<Object> = [];

    if (leaderboard == undefined) {
        return undefined;
    }

    leaderboard.scores.forEach((play: any, index: any) => {
        leaderboardArray.push({ position: index, value: play });
    })

    return leaderboardArray;
}

export async function getLeaderBoardPosition(mapid: any, mode: any, scoreid: any) {

    const leaderboard: any = await loadLeaderBoard(mapid, mode);

    if (leaderboard.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const leaderboardArray: Array<Object> = [];

    if (leaderboard == undefined) {
        return null;
    }

    leaderboard.scores.forEach((play: any, index: any) => {
        leaderboardArray.push({ position: index, value: play });
    })

    const leaderboard_found: any = leaderboardArray.find((t: any) => t.value.id === scoreid);
    let leaderboard_position = undefined;

    if (leaderboard_found !== undefined)
    leaderboard_position = leaderboard_found.position;

    return leaderboard_position;
}