import { OsuBeatmap } from "../../../interfaces/osu/beatmap/osuBeatmap";
import { login } from "../../utility/banchoLogin";
import Beatmap from "../../../mongodb/beatmap";
import { v2 } from "osu-api-extended";
import { OsuSet } from "../../../interfaces/osu/beatmap/osuSet";

export async function getBeatmapBancho(mapid: number) {
    await login();

    try {

        const result: OsuBeatmap = await v2.beatmap.id.lookup({ id: mapid })

        const beatmapObject = new Beatmap();

        beatmapObject.checksum = result.checksum;
        beatmapObject.mapid = result.id.toString();
        beatmapObject.beatmap = result;

        await beatmapObject.save();

        return result;

    } catch {
        throw new Error("NOSERVER");
    }

}

export async function getBeatmapSetBancho(setid: number) {
    await login();

    try {

        const result: OsuSet = await v2.beatmap.set.lookup(setid);

        return result

    } catch {
        throw new Error("NOSERVER");
    }
}

export async function getBeatmapFromCache(mapid: number, checksum?: string) {

    let beatmapObject = await Beatmap.findOne({ mapid: mapid });

    if (beatmapObject == undefined || beatmapObject.checksum != checksum || beatmapObject.beatmap == undefined) {

        const result = getBeatmapBancho(mapid);

        return result;

    } else {
        return beatmapObject.beatmap as OsuBeatmap;
    }
}
