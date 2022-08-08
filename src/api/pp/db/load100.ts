import PerformancePoints from "../../../models/PerformancePoints";
import { downloadBeatmap } from "../../beatmaps/downloadbeatmap";
import { max } from "../max";

export async function loadacc100(mapid: any, checksum: any, mode: any, modArray: any) {
    return new Promise(async (resolve, reject) => {

        let returnpp: any;

        let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray });

        if (ppObject == undefined || ppObject.pp == null || ppObject.checksum != checksum) {

            await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, mapid);

            let maxpp: any = await max(mapid, checksum, mode, modArray).catch(() => {
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
            ppObject.pp[100] = maxpp;

            await ppObject.save();

        }

        returnpp = ppObject;

        return resolve(returnpp);
    })
}

export async function loadacc100WithoutBeatMapDownload(mapid: any, checksum: any, modArray: any, mode: any) {
    return new Promise(async (resolve, reject) => {

        let generatedpp: any = [];
        let returnpp: any;

        let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray, mode: mode });

        if (ppObject == undefined || ppObject.pp == null || ppObject.pp[0] == null || ppObject.checksum != checksum) {

            let maxpp: any = await max(mapid, checksum, mode, modArray).catch(() => {
                return reject(null);
            })

            if (ppObject == undefined)
                ppObject = new PerformancePoints();

            ppObject.mapid = mapid;
            ppObject.mode = mode;
            ppObject.checksum = checksum;
            ppObject.mods = modArray;

            ppObject.pp = { 100: maxpp };

            await ppObject.save();

        }

        returnpp = ppObject;

        return resolve(returnpp);
    })
}