import PerformancePoints from "../../../mongodb/performancePoints";
import { downloadBeatmap } from "../../utility/downloadbeatmap";
import { max } from "../rosupp/max";

export async function loadacc100(mapid: number, checksum: string, mode: string, modArray: string[]) {

    let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray });

    if (ppObject == undefined || ppObject.pp == null || ppObject.checksum != checksum) {

        await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, mapid);

        const maxpp = await max(mapid, checksum, mode, modArray);

        if (ppObject == undefined)
            ppObject = new PerformancePoints();

        ppObject.mapid = mapid.toString();
        ppObject.checksum = checksum;
        ppObject.mods = modArray;

        if (ppObject.pp == undefined) {
            ppObject.pp = {};
        }

        if (maxpp)
            ppObject.pp[100] = maxpp;

        await ppObject.save();

    }

    return ppObject;

}

export async function loadacc100WithoutBeatMapDownload(mapid: number, checksum: string, modArray: string[], mode: string) {

    let ppObject = await PerformancePoints.findOne({ mapid: mapid, mods: modArray, mode: mode });

    if (ppObject == undefined || ppObject.pp == null || ppObject.pp[0] == null || ppObject.checksum != checksum) {

        const maxpp = await max(mapid, checksum, mode, modArray)

        if (ppObject == undefined)
            ppObject = new PerformancePoints();

        ppObject.mapid = mapid.toString();
        ppObject.mode = mode;
        ppObject.checksum = checksum;
        ppObject.mods = modArray;

        if (maxpp)
            ppObject.pp = { 100: maxpp };

        await ppObject.save();

    }

    return ppObject;
}