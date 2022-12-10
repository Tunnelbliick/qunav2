import Beatmap from "../../models/Beatmap";
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

    let promise_list: any[] = [];

    let mapidlist: any[] = [];
    let checksumlist: any[] = [];

    top100.forEach((top: any) => {
        mapidlist.push(top.mapid);
    });

    let beatmaps = await Beatmap.find({ mapid: { $in: mapidlist }});
    let beatmapMap = new Map<any, any>();

    beatmaps.forEach((beatmap: any) => {

        beatmapMap.set(beatmap.beatmap.id, beatmap.beatmap);

    })

    top100.forEach((top: any) => {

        let beatmap: any = beatmapMap.get(top.mapid);
        top.beatmap = beatmap
        top.beatmapset = beatmap.beatmapset;

        returnArray.push(top);

    })

    return returnArray;

}