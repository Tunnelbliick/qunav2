import PerformancePoints from "../../../models/PerformancePoints";
import { downloadBeatmap } from "../../beatmaps/downloadbeatmap";
import { max } from "../max";

export async function loadacc100(mapid: string, checksum: string, mode: number, modArray: string[]) {
    return new Promise(async (resolve, reject) => {

        let returnpp: any;

        let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray });

        if (ppObject == undefined || ppObject.pp == null || ppObject.checksum != checksum) {

            await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, mapid);

            const maxpp = await max(mapid, checksum, mode, modArray).catch(() => {
                return reject(null);
            })

            if (ppObject == undefined)
                ppObject = new PerformancePoints();

            ppObject.mapid = mapid;
            ppObject.checksum = checksum;
            ppObject.mods = modArray;

            if (ppObject.pp == undefined) {
                ppObject.pp = {};
            }

            if (maxpp) {
                // Ensure ppObject.pp is initialized as an object
                if (!ppObject.pp) {
                    ppObject.pp = {};
                }

                // Now safely set the property
                ppObject.pp[0] = { 100: maxpp };
            }

            await ppObject.save();

        }

        returnpp = ppObject;

        return resolve(returnpp);
    })
}

export async function loadacc100WithoutBeatMapDownload(mapid: string, checksum: string, modArray: string[], mode: number) {
    return new Promise(async (resolve, reject) => {

        let returnpp: any;

        let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray, mode: mode });

        if (ppObject == undefined || ppObject.pp == null || ppObject.pp[0] == null || ppObject.pp[0][100] == null || ppObject.checksum != checksum) {

            const maxpp = await max(mapid, checksum, mode, modArray).catch(() => {
                return reject(null);
            })

            if (ppObject == undefined)
                ppObject = new PerformancePoints();

            ppObject.mapid = mapid;
            ppObject.mode = mode;
            ppObject.checksum = checksum;
            ppObject.mods = modArray;

            if (maxpp) {
                // Ensure ppObject.pp is initialized as an object
                if (!ppObject.pp) {
                    ppObject.pp = {};
                }

                // Now safely set the property
                ppObject.pp[0] = { 100: maxpp };
            }


            await ppObject.save();

        }

        returnpp = ppObject;

        return resolve(returnpp);
    })
}