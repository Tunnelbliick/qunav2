import { AnyComponentBuilder } from "@discordjs/builders"
import { v2 } from "osu-api-extended"
import { login } from "../../utility/banchoLogin";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { Best } from "../../../interfaces/osu/top/top";

export enum LeaderboardType {
    NORMAL,
    NOTSUBMITTED,
    FAILED,
    URANKED // This is for quna unranked leaderboard just future proof
}

export class LeaderboardPosition {
    index: number | undefined = undefined;
    type: LeaderboardType | undefined = undefined;
}

async function loadLeaderBoard(mapid: number, mode: Gamemode) {

    try {

        await login();
        const data: object = v2.scores.beatmap(mapid, { mode: mode, type: "global" })

        if (data.hasOwnProperty("error")) {
            throw new Error("NOTFOUNDID");
        }

        return data as OsuScore[];

    } catch {
        throw new Error("NOSERVER");
    }

}


export async function getLeaderBoard(mapid: number, mode: Gamemode) {

    const leaderboard: OsuScore[] = await loadLeaderBoard(mapid, mode);

    if (leaderboard.hasOwnProperty("error")) {
        return "osuapierr";
    }

    const leaderboardArray: Array<Best> = [];

    if (leaderboard == undefined) {
        return undefined;
    }

    leaderboard.forEach((play: OsuScore, index: number) => {
        leaderboardArray.push({ position: index, value: play });
    })

    return leaderboardArray;
}

export async function getLeaderBoardPosition(mapid: number, mode: Gamemode, scoreid: any) {

    const leaderboard: OsuScore[] = await loadLeaderBoard(mapid, mode);

    const leaderboardArray: Array<Best> = [];

    if (leaderboard == undefined) {
        return null;
    }

    leaderboard.forEach((play: OsuScore, index: number) => {
        leaderboardArray.push({ position: index, value: play });
    })

    const leaderboard_found: Best | undefined = leaderboardArray.find((t: Best) => t.value.id === scoreid);
    let leaderboard_position = undefined;

    if (leaderboard_found !== undefined)
        leaderboard_position = leaderboard_found.position;

    return leaderboard_position;
}

export async function getLeaderBoardPositionByScore(mapid: number, mode: Gamemode, score: OsuScore) {

    const leaderboard: OsuScore[] = await loadLeaderBoard(mapid, mode);

    const leaderboardArray: Array<Best> = [];

    if (leaderboard == undefined) {
        return undefined;
    }

    leaderboard.forEach((play: OsuScore, index: number) => {
        leaderboardArray.push({ position: index, value: play });
    })

    const position: LeaderboardPosition = new LeaderboardPosition();
    let found_leaderboard: Best | undefined = leaderboardArray.find((t: Best) => t.value.id === score.id);

    if (found_leaderboard === undefined) {
        found_leaderboard = leaderboardArray.find((t: Best) => t.value.score < score.score);

        if (found_leaderboard !== undefined) {
            position.index = found_leaderboard.position;

            if (score.rank === "F") {
                position.type = LeaderboardType.FAILED;
            } else {
                position.type = LeaderboardType.NOTSUBMITTED;
            }
        }
    } else {
        position.index = found_leaderboard.position;
        position.type = LeaderboardType.NORMAL
    }

    return position;
}