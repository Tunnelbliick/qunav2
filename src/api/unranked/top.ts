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

    const promise_list: any[] = [];

    const mapidlist: any[] = [];
    const checksumlist: any[] = [];

    top100.forEach((top: any) => {
        mapidlist.push(top.mapid);
    });

    const beatmaps = await Beatmap.find({ mapid: { $in: mapidlist }});
    const beatmapMap = new Map<any, any>();

    beatmaps.forEach((beatmap: any) => {

        beatmapMap.set(beatmap.beatmap.id, beatmap.beatmap);

    })

    top100.forEach((top: any) => {

        const beatmap: any = beatmapMap.get(top.mapid);
        top.beatmap = beatmap
        top.beatmapset = beatmap.beatmapset;

        if(top.pp == null) {
            top.pp = 0;
        }
        
        returnArray.push(top);

    })

    return returnArray;

}