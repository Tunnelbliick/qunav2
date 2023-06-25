import axios from "axios";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { Beatmap } from "../../../interfaces/osu/beatmap/beatmap";
import { OsuBeatmap } from "../../../interfaces/osu/beatmap/osuBeatmap";
import { AkatsukiScore } from "../../../interfaces/osu/score/akatsukiScore";
import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";
import { decomposeMods } from "../../../utility/parsemods";
import { downloadBeatmap } from "../../utility/downloadbeatmap";
import { calcRetries, filterRecent } from "../../utility/recentUtility";
import { sentryError } from "../../utility/sentry";
import { calculateAcc } from "../../utility/stats";
import { getBeatmapFromCache } from "../beatmap/beatmap";
import { LeaderboardPosition } from "../leaderboard/leaderboard";
import { getAkatsukiUserById } from "../profile/profile";
import { TopPosition } from "../top/top";
import { CommonData, CommonDataReturnTypes, RecentPlayArguments, RecentScore, getPerformance } from "./recent";
import beatmap from "../../../mongodb/beatmap";

export async function getRecentAkatsuki(
    userid: string | number,
    relax: 0 | 1 | 2,
    limit: number
) {
    try {

        const data: AkatsukiScore[] = await (await axios.get(`${process.env.AKATSUKI_API}/get_user_recent?rx=${relax}&u=${userid}`)).data

        if (data.hasOwnProperty("error")) {
            throw new Error("NOTFOUNDID");
        }

        const beatmapids: string[] = data.map(d => d.beatmap_id);

        const beatmaps: Beatmap[] = await beatmap.find({ mapid: { $in: beatmapids } });
        const beatmap_map: Map<string, OsuBeatmap> = new Map<string, OsuBeatmap>();

        beatmaps.forEach(b => {
            beatmap_map.set(b.id.toString(), b.beatmap as OsuBeatmap);
        })

        const mapped = await Promise.all(data.map(async d => {
            const foundBeatmap = beatmap_map.get(d.beatmap_id);

            if (foundBeatmap === undefined) {
                d.beatmap = await getBeatmapFromCache(+d.beatmap_id)
            } else {
                d.beatmap = foundBeatmap;
            }

            return convertToOsu(d);
        }));

        return mapped as OsuScore[];
    } catch (error) {

        console.log(error);

        throw new Error("NOSERVER");
    }
}

export async function getRecentPlaysForUserAkatsuki(userid: number, args: RecentPlayArguments, mode?: Gamemode) {

    // Get recent plays
    const max = 50;
    const offset = args.offset;
    const limit = max - offset;

    const recentplays = await getRecentAkatsuki(userid, 0, limit);
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

    const common = await getCommonDataAkatsuki(recentplay);
    const performance = await getPerformance(recentplay);

    const recentScore: RecentScore = new RecentScore();

    recentScore.retry_count = retries;
    recentScore.score = recentplay;
    recentScore.beatmap = common.beatmap;
    recentScore.user = common.user;
    recentScore.leaderboard = common.leaderboard;
    recentScore.best = common.best;
    recentScore.performance = performance;
    recentScore.server = args.server;

    return recentScore;
}

async function getCommonDataAkatsuki(score: OsuScore) {

    const common: CommonData = new CommonData();

    const user = getAkatsukiUserById(score.user_id);
    const leaderboard = new LeaderboardPosition();
    const best = new TopPosition();

    await Promise.allSettled([undefined, user, leaderboard, best]).then((result: PromiseSettledResult<CommonDataReturnTypes>[]) => {
        result.forEach((outcome, index) => {
            if (outcome.status === 'rejected') {
                const err = new Error(`Promise ${index} was rejected with reason: ${outcome.reason}`)
                sentryError(err);
            } else {
                switch (index) {
                    case 0:
                        common.beatmap = score.beatmap as OsuBeatmap;
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


function convertToOsu(score: AkatsukiScore) {

    const osuScore: OsuScore = {
        accuracy: 0,
        beatmap: score.beatmap,
        beatmapset: score.beatmap.beatmapset,
        created_at: score.date,
        id: 0,
        max_combo: +score.maxcombo,
        max_pp: undefined,
        mode: "osu",
        mode_int: 0,
        mods: decomposeMods(+score.enabled_mods),
        passed: true,
        pp: +score.pp,
        replay: false,
        score: +score.score,
        perfect: undefined,
        statistics: {
            count_300: +score.count300,
            count_100: +score.count100,
            count_50: +score.count50,
            count_geki: +score.countgeki,
            count_katu: +score.countkatu,
            count_miss: +score.countmiss
        },
        user_id: +score.user_id,
        rank: score.rank
    }

    const total_objects = osuScore.beatmap.count_circles + osuScore.beatmap.count_sliders + osuScore.beatmap.count_spinners;
    osuScore.accuracy = calculateAcc(osuScore, total_objects) / 100;

    return osuScore;

}