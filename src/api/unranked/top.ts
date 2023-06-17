import { Gamemode } from "../../interfaces/enum/gamemodes";
import score from "../../mongodb/score";
import beatmap from "../../mongodb/beatmap";
import { Beatmap } from "../../interfaces/osu/beatmap/beatmap";
import { OsuBeatmap } from "../../interfaces/osu/beatmap/osuBeatmap";
import { Score } from "../../interfaces/osu/score/score";
import { OsuScore } from "../../interfaces/osu/score/osuScore";

export async function loadUnrankedTop(user_id: number, mode: Gamemode) {

    const returnArray: OsuScore[] = [];

    if (isNaN(user_id))
        return [];

    const userid = +user_id;

    const top100: Score[] = await score.find({
        osuid: userid,
        mode: mode,
        max_pp: { $lte: 3000 }
    }).sort({ pp: -1 }).limit(100).exec();

    const mapidlist: number[] = [];

    top100.forEach((top: Score) => {
        mapidlist.push(top.mapid);
    });

    const beatmaps: Beatmap[] = await beatmap.find({ mapid: { $in: mapidlist } });
    const beatmapMap = new Map<number, OsuBeatmap>();

    beatmaps.forEach((beatmap: Beatmap) => {

        const map: OsuBeatmap = beatmap.beatmap as OsuBeatmap;

        beatmapMap.set(map.id, map);

    })

    top100.forEach((top: Score) => {

        const beatmap = beatmapMap.get(top.mapid);

        const score: OsuScore = {
            accuracy: top.accuracy,
            beatmap: beatmap!,
            beatmapset: beatmap!.beatmapset,
            created_at: top.created_at.toString(),
            id: 0,
            max_combo: top.max_combo,
            mode: top.mode,
            mode_int: top.mode_int,
            mods: top.mods,
            passed: true,
            perfect: false,
            pp: top.pp,
            max_pp: top.max_pp,
            replay: false,
            score: top.score,
            statistics: top.statistics,
            user_id: top.osuid,

        };

        returnArray.push(score);

    })

    return returnArray;

}