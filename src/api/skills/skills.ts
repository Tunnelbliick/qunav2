import asyncBatch from "async-batch";
import { downloadAndOverrideBeatmap } from "../beatmaps/downloadbeatmap";
import { loaddifficulty } from "../pp/db/loaddifficutly";

export interface skills {
    aim: number;
    acc: number;
    speed: number;
}

export async function generateskills(top_100: any) {

    if (top_100 == null) {
        return;
    }

    const test1 = await asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {
                    let dest = `${process.env.FOLDER_TEMP}${task.value.beatmap.id}_${task.value.beatmap.checksum}.osu`;
                    downloadAndOverrideBeatmap('https://osu.ppy.sh/osu/', dest, task.value.beatmap.id).then(() => { return resolve(true) });
                } else {
                    return resolve(null);
                }
            }
        ),
        2,
    );

    let aim: any = [];
    let acc: any = [];
    let speed: any = [];

    let aimpp = 0;
    let accpp = 0;
    let speedpp = 0;


    const test = await asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {
                    loaddifficulty(task.value.beatmap.id, task.value.beatmap.checksum, task.value.mods, task.value.mode).then((value: any) => {

                        let stats = value;

                        let totalHits = task.value.beatmap.count_circles + task.value.beatmap.count_sliders + task.value.beatmap.count_spinners;

                        // It is possible to reach a negative accuracy with this formula. Cap it at zero - zero points.

                        let accuracyValue = Math.pow(task.value.accuracy, stats.star / 10 * stats.od) * stats.star / 2 * 1.11

                        accuracyValue *= Math.min(1.13, Math.pow(totalHits / 1000.0, 0.23));

                        aim.push(stats.aim * 10);
                        acc.push(accuracyValue * 10);
                        speed.push(stats.speed * 10);
                        return resolve(stats)
                    });
                } else {
                    return resolve(null);
                }
            }
        ),
        10,
    );

    aim.sort((a: any, b: any) => { return b - a; }).forEach((a: any, n: number) => {
        aimpp += a * Math.pow(0.95, n);
    })

    acc.sort((a: any, b: any) => { return b - a; }).forEach((a: any, n: number) => {
        accpp += a * Math.pow(0.95, n);;
    })

    speed.sort((a: any, b: any) => { return b - a; }).forEach((a: any, n: number) => {
        speedpp += a * Math.pow(0.95, n);
    })

    let skills: skills = {
        aim: aimpp,
        acc: accpp,
        speed: speedpp
    }

    return skills;

}