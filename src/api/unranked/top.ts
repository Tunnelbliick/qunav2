import score from "../../models/score";
import { getBeatmapFromCache } from "../osu/beatmap";

export async function loadUnrankedTop(user_id: any, mode: any) {

    const returnArray: object[] = [];

    if (isNaN(user_id))
        return [];

    const userid = +user_id;

    const top100: object[] = await score.find({
        osuid: userid,
        mode: mode,
        max_pp: { $lte: 3000 }
    }).sort({ pp: -1 }).limit(100).exec();

    top100.forEach(async (top: any) => {

        const beatmap: any = await getBeatmapFromCache(top.mapid, top.checksum);
        top.beatmap = { id: top.mapid, checksum: top.checksum }
        top.beatmapset = beatmap;

        returnArray.push(top);

    })

    return returnArray;

}