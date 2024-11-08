import PerformancePoints from "../../../models/PerformancePoints";
import { downloadBeatmap } from "../../beatmaps/downloadbeatmap";
import { calculate } from "../calculate";

const maxDecimate = 200;

export async function loadMapPP(data: any, modArray: any, mode: number) {
    let generatedpp: any;
    let returnpp: any;

    let ppObject: any = await PerformancePoints.findOne({ mapid: data.id, mods: modArray, mode: mode });

    if (ppObject == undefined || ppObject.checksum != data.checksum) {

        await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${data.id}_${data.checksum}.osu`, data.id);

        generatedpp = await calculate(data.id, data.checksum, mode, modArray);

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

        generatedpp = await calculate(data.id, data.checksum, mode, modArray);

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

export async function loadMapPPWithoutDownload(data: any, modArray: any, mode: number) {
    let generatedpp: any;
    let returnpp: any;

    let ppObject: any = await PerformancePoints.findOne({ mapid: data.id, mods: modArray, mode: mode });

    if (ppObject == undefined || ppObject.checksum != data.checksum) {

        generatedpp = await calculate(data.id, data.checksum, mode, modArray);

        if (ppObject == undefined) {
            ppObject = new PerformancePoints();
            ppObject.mods = modArray;
        }

        ppObject.mapid = data.id;
        ppObject.checksum = data.checksum;
        ppObject.mode = generatedpp.difficulty.mode;
        ppObject.pp = generatedpp.pp;
        ppObject.difficulty = generatedpp.difficulty;
        ppObject.graph = decimate(generatedpp.graph);

        await ppObject.save();

    } else if (ppObject != undefined && (ppObject.pp == undefined || Object.keys(ppObject.pp).length <= 1)) {

        generatedpp = await calculate(data.id, data.checksum, mode, modArray);

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

    generatedpp = await calculate(ppObject.mapid, ppObject.checksum, ppObject.mode ?? 0, ppObject.mods);

    if (ppObject == undefined) {
        ppObject = new PerformancePoints();
        ppObject.mods = [];
    }

    ppObject.mapid = ppObject.mapid;
    ppObject.checksum = ppObject.checksum;
    ppObject.mode = generatedpp.difficulty.mode;
    ppObject.pp = generatedpp.pp;
    ppObject.difficulty = generatedpp.difficulty;
    ppObject.graph = decimate(generatedpp.graph);

    await ppObject.save();

    returnpp = ppObject;

    return returnpp;

}

function decimate(graph: Record<string, any>): Record<string, any> {
    for (const key in graph) {
        const value = graph[key];

        if (value instanceof Float64Array) {
            const data: Array<{ y: number; x: number }> = [];
            let time = 0;
            let step = 0;
            let sum = 0;

            // Calculate the decimation step
            const maxStep = Math.round(value.length / maxDecimate);

            // Iterate through the Float64Array
            value.forEach((v) => {
                if (maxStep <= 1) {
                    // If maxStep is 1 or less, push every point
                    data.push({ y: v, x: time });
                    time += 400;
                } else {
                    // Accumulate values for averaging
                    sum += v;
                    step++;

                    if (step === maxStep) {
                        // Push the averaged value
                        data.push({ y: parseFloat((sum / maxStep).toFixed(3)), x: time });
                        step = 0;
                        sum = 0;
                        time += 400;
                    }
                }
            });

            // Update the graph with decimated data
            graph[key] = data;
        }
    }

    return graph;
}

