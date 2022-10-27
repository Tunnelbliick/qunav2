import PerformancePoints from "../../../models/PerformancePoints";
import { downloadBeatmap } from "../../beatmaps/downloadbeatmap";
import { calcualte } from "../calculate";
import { difficulty } from "../difficulty";
import { max } from "../max";

const maxDecimate = 200;

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
        ppObject.graph = decimate(generatedpp.graph);

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
        ppObject.graph = decimate(generatedpp.graph);

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
        ppObject.graph = decimate(generatedpp.graph);

        await ppObject.save();

    } else if (ppObject != undefined && (ppObject.pp == undefined || Object.keys(ppObject.pp).length <= 1)) {

        generatedpp = await calcualte(data.id, data.checksum, mode, modArray);

        if (ppObject.pp == undefined) {
            ppObject.pp = {};
        }
        ppObject.pp = generatedpp.pp;
        ppObject.difficulty = generatedpp.difficulty;
        ppObject.mode = mode;
        ppObject.graph = decimate(generatedpp.graph);

        await ppObject.save();

    }

    returnpp = ppObject;

    return returnpp;

}

export async function recalculateBeatMap(ppObject: any) {

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${ppObject.mapid}_${ppObject.checksum}.osu`, ppObject.mapid);

    let generatedpp: any;
    let returnpp: any;

    generatedpp = await calcualte(ppObject.mapid, ppObject.checksum, ppObject.mode, ppObject.mods);

    if (ppObject == undefined) {
        ppObject = new PerformancePoints();
        ppObject.mods = []; 
    }

    ppObject.mapid = ppObject.mapid;
    ppObject.checksum = ppObject.checksum;
    ppObject.mode = ppObject.mode;
    ppObject.pp = generatedpp.pp;
    ppObject.difficulty = generatedpp.difficulty;
    ppObject.graph = decimate(generatedpp.graph);

    await ppObject.save();

    returnpp = ppObject;

    return returnpp;

}

function decimate(graph: any) {

    for (const key in graph) {

        const value: any = graph[key];

        if (isNaN(value)) {

            const data: any[] = []
            let time = 0;
            let step = 0;
            let avg = 0;
            const max_step = Math.round(value.length / maxDecimate);

            value.forEach((v: any) => {

                if (max_step <= 1) {
                    data.push({ y: +v, x: time });
                    time += graph.section_length;
                } else {
                    avg += +v;

                    if (max_step == step) {

                        data.push({ y: parseFloat((avg / max_step).toFixed(3)), x: time });
                        step = 0;
                        avg = 0;
                        time += graph.section_length * max_step;
                    }
                    step++;
                }
            })
            graph[key] = data;
        }
    }
    return graph;
}