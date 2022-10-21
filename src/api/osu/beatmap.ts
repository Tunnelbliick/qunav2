import Beatmap from "../../models/Beatmap";
import { login } from "./login";
import { v2 } from "osu-api-extended";


export async function getBeatmap(mapid: any) {
    await login();
    return new Promise((resolve, reject) => {
        const result = v2.beatmap.lookup.diff({id: mapid})

        result.then(async (data: any) => {

            const beatmapObject = new Beatmap();

            beatmapObject.checksum = data.checksum;
            beatmapObject.mapid = data.id;
            beatmapObject.beatmap = data;

            await beatmapObject.save();

            return resolve(data);
        });
    });
}

export async function getBeatmapSet(setid: number) {
    await login();
    return new Promise((resolve, reject) => {
        const result = v2.beatmap.set(setid);

        result.then((data: any) => {
            return resolve(data);
        });
    });
}

export async function getBeatmapFromCache(mapid: any, checksum?: any) {

    let beatmapObject: any = await Beatmap.findOne({ mapid: mapid });

    if (beatmapObject == undefined || beatmapObject.checksum != checksum || beatmapObject.beatmap == undefined) {
        await login();
        return new Promise((resolve, reject) => {

            const result = v2.beatmap.lookup.diff({id: mapid})

            result.then(async (data: any) => {

                if (beatmapObject == undefined)
                    beatmapObject = new Beatmap();

                beatmapObject.checksum = data.checksum;
                beatmapObject.mapid = data.id;
                beatmapObject.beatmap = data;

                await beatmapObject.save();

                return resolve(data);
            });
        });
    } else {
        return (beatmapObject.beatmap);
    }
}
