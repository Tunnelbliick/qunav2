import PerformancePoints from "../../../models/PerformancePoints";
import { difficulty } from "../difficulty";

export async function loaddifficulty(mapid: any, checksum: any, modArray: any, mode: any) {
    return new Promise(async (resolve, reject) => {
        let returnpp: any;

        let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray });

        if (ppObject == undefined || ppObject.difficulty == null || ppObject.checksum != checksum) {

            let raiting: any = await difficulty(mapid, checksum, mode, modArray).catch(() => {
                return reject(null);
            })

            if (ppObject == undefined)
                ppObject = new PerformancePoints();

            ppObject.mapid = mapid;
            ppObject.checksum = checksum;
            ppObject.mods = modArray;

            ppObject.difficulty = raiting

            await ppObject.save();

        }

        returnpp = ppObject;

        return resolve(returnpp.difficulty);
    })
}