import PerformancePoints from "../../../models/PerformancePoints";
import { downloadBeatmap } from "../../beatmaps/downloadbeatmap";
import { calcualte } from "../calculate";
import { difficulty } from "../difficulty";
import { max } from "../max";

export async function loadMapPP(data: any, modArray: any, mode: any) {
    let generatedpp: any;
    let returnpp: any;

    let ppObject: any = await PerformancePoints.findOne({ mapid: data.id, mods: modArray, mode: mode });

    if (ppObject == undefined || ppObject.checksum != data.checksum) {

        await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${data.id}_${data.checksum}.osu`, data.id);

        generatedpp = await calcualte(data.id, data.checksum, mode, modArray);

        if (ppObject == undefined) {
            ppObject = new PerformancePoints();
            ppObject.mods = modArray;
        }

        ppObject.mapid = data.id;
        ppObject.checksum = data.checksum;
        ppObject.mode = mode;
        ppObject.pp = generatedpp.pp;
        ppObject.difficulty = generatedpp.difficulty;
        ppObject.graph = generatedpp.graph;

        await ppObject.save();

    } else if (ppObject != undefined && (ppObject.pp == undefined || Object.keys(ppObject.pp).length <= 1)) {

        await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${data.id}_${data.checksum}.osu`, data.id);

        generatedpp = await calcualte(data.id, data.checksum, mode, modArray);

        if (ppObject.pp == undefined) {
            ppObject.pp = {};
        }
        ppObject.pp = generatedpp.pp;
        ppObject.mode = mode;
        ppObject.difficulty = generatedpp.difficulty;
        ppObject.graph = generatedpp.graph;

        await ppObject.save();

    }

    returnpp = ppObject;

    return returnpp;

}

export async function loadMapPPWithoutDownload(data: any, modArray: any, mode: any) {
    let generatedpp: any;
    let returnpp: any;

    let ppObject: any = await PerformancePoints.findOne({ mapid: data.id, mods: modArray, mode: mode });

    if (ppObject == undefined || ppObject.checksum != data.checksum) {

        generatedpp = await calcualte(data.id, data.checksum, mode, modArray);

        if (ppObject == undefined) {
            ppObject = new PerformancePoints();
            ppObject.mods = modArray;
        }

        ppObject.mapid = data.id;
        ppObject.checksum = data.checksum;
        ppObject.mode = mode;
        ppObject.pp = generatedpp.pp;
        ppObject.difficulty = generatedpp.difficulty;
        ppObject.graph = generatedpp.graph;

        await ppObject.save();

    } else if (ppObject != undefined && (ppObject.pp == undefined || Object.keys(ppObject.pp).length <= 1)) {

        generatedpp = await calcualte(data.id, data.checksum, mode, modArray);

        if (ppObject.pp == undefined) {
            ppObject.pp = {};
        }
        ppObject.pp = generatedpp.pp;
        ppObject.difficulty = generatedpp.difficulty;
        ppObject.mode = mode;
        ppObject.graph = generatedpp.graph;

        await ppObject.save();

    }

    returnpp = ppObject;

    return returnpp;

}