import { v2 } from "osu-api-extended";
import { BanchoParams } from "../../../interfaces/arguments";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { login } from "../../utility/banchoLogin";
import { downloadBeatmap } from "../../utility/downloadbeatmap";
import { calcRetries, filterRecent } from "../../utility/recentUtility";
import { CommonData, CommonDataReturnTypes, RecentPlayArguments, RecentScore, getPerformance } from "./recentHandler";
import { getBeatmapFromCache } from "../beatmap/beatmap";
import { getBanchoUserById } from "../profile/profile";
import { LeaderboardPosition, getLeaderBoardPositionByScore } from "../leaderboard/leaderboard";
import { TopPosition, getTopPositionForUser } from "../top/top";
import { sentryError } from "../../utility/sentry";
import { OsuBeatmap } from "../../../interfaces/osu/beatmap/osuBeatmap";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";

export async function getRecentBancho(
    userid: number,
    include_fails?: boolean,
    limit?: string,
    mode?: Gamemode,
    offset?: string
) {
    try {
        await login();

        const params: BanchoParams = {
            include_fails,
            limit,
            mode,
            offset
        };

        const data: object = await v2.scores.user.category(userid, "recent", params);

        if (data.hasOwnProperty("error")) {
            throw new Error("NOTFOUNDID");
        }

        return data as OsuScore[];
    } catch {
        throw new Error("NOSERVER");
    }
}


export async function getRecentPlaysForUserBancho(userid: number, args: RecentPlayArguments, mode?: Gamemode) {

    // Get recent plays
    const max = 50;
    const offset = args.offset;
    const limit = max - offset;


    const recentplays = await getRecentBancho(userid, args.include_fails, limit.toString(), mode, offset.toString());
    if (recentplays.length == 0) {
        throw new Error("NORECENTPLAYS");
    }

    // Apply filter
    const filterFoundIndex = filterRecent(recentplays, args);
    if (filterFoundIndex == -1) {
        throw new Error("NOPLAYFOUND");
    }

    const recentplay = recentplays[filterFoundIndex];
    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${recentplay.beatmap.id}_${recentplay.beatmap.checksum}.osu`, recentplay.beatmap.id);
    const retries = calcRetries(recentplays, recentplay.beatmap.id, recentplay.mods);

    const common = await getCommonData(recentplay);
    const performance = await getPerformance(recentplay);

    const recentScore: RecentScore = new RecentScore();

    recentScore.retry_count = retries;
    recentScore.score = recentplay;
    recentScore.beatmap = common.beatmap;
    recentScore.user = common.user;
    recentScore.leaderboard = common.leaderboard;
    recentScore.best = common.best;
    recentScore.performance = performance;

    return recentScore;
}

async function getCommonData(score: OsuScore) {

    const common: CommonData = new CommonData();

    const isunranked = score.pp === null ? true : false;

    const beatmap = getBeatmapFromCache(score.beatmap.id, score.beatmap.checksum);
    const user = getBanchoUserById(score.user_id);
    const leaderboard = getLeaderBoardPositionByScore(score.beatmap.id, score.mode as Gamemode, score);
    const best = getTopPositionForUser(score, score.mode as Gamemode, isunranked);

    await Promise.allSettled([beatmap, user, leaderboard, best]).then((result: PromiseSettledResult<CommonDataReturnTypes>[]) => {
        result.forEach((outcome, index) => {
            if (outcome.status === 'rejected') {
                const err = new Error(`Promise ${index} was rejected with reason: ${outcome.reason}`)
                sentryError(err);
            } else {
                switch (index) {
                    case 0:
                        common.beatmap = outcome.value as OsuBeatmap;
                        break;
                    case 1:
                        common.user = outcome.value as OsuUser;
                        break;
                    case 2:
                        common.leaderboard = outcome.value as LeaderboardPosition;
                        break;
                    case 3:
                        common.best = outcome.value as TopPosition;
                }
            }
        });
    })

    return common;

}