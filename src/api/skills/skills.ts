import asyncBatch from "async-batch";
import { downloadAndOverrideBeatmap } from "../beatmaps/downloadbeatmap";
import { loaddifficulty } from "../pp/db/loaddifficutly";

export interface skills {
    aim: number;
    acc: number;
    speed: number;
}

export interface all_skills {
    aim: Array<any>;
    acc: Array<any>;
    speed: Array<any>;
    star: Array<any>;
    aim_avg: number;
    acc_avg: number;
    speed_avg: number;
    star_avg: number;
}

export async function getTotalSkills(top_100: any) {

    if (top_100 == null) {
        return;
    }

    const dopwnload_beatmaps = asyncBatch(top_100,
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

    const skip = new Promise((res) => setTimeout(() => res("skip"), 5000));

    let check_which_won = await Promise.race([skip, dopwnload_beatmaps]);

    if(check_which_won === "skip") {
        return undefined;
    }

    let aim: any = [];
    let acc: any = [];
    let speed: any = [];

    let aimpp = 0;
    let accpp = 0;
    let speedpp = 0;


    const generateSkills = await asyncBatch(top_100,
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

export async function getAllSkills(top_100: any) {

    if (top_100 == null) {
        return;
    }

    const dopwnload_beatmaps = asyncBatch(top_100,
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

    const skip = new Promise((res) => setTimeout(() => res("skip"), 5000));

    let check_which_won = await Promise.race([skip, dopwnload_beatmaps]);

    if(check_which_won === "skip") {
        return undefined;
    }

    let aim: any = [];
    let acc: any = [];
    let speed: any = [];
    let star: any = [];

    const generateSkills = await asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {
                    loaddifficulty(task.value.beatmap.id, task.value.beatmap.checksum, task.value.mods, task.value.mode).then((value: any) => {

                        let stats = value;

                        let totalHits = task.value.beatmap.count_circles + task.value.beatmap.count_sliders + task.value.beatmap.count_spinners;

                        // It is possible to reach a negative accuracy with this formula. Cap it at zero - zero points.

                        let accuracyValue = Math.pow(task.value.accuracy, stats.star / 10 * stats.od) * stats.star / 2 * 1.11

                        accuracyValue *= Math.min(1.13, Math.pow(totalHits / 1000.0, 0.23));

                        aim.push({ value: stats.aim * 10, score: task.value });
                        acc.push({ value: accuracyValue * 10, score: task.value });
                        speed.push({ value: stats.speed * 10, score: task.value });
                        star.push({ value: stats.star, score: task.value })
                        return resolve(stats)
                    });
                } else {
                    return resolve(null);
                }
            }
        ),
        10,
    );

    let aim_avg = 0;
    let acc_avg = 0;
    let speed_avg = 0;
    let star_avg = 0;

    aim = aim.sort((a: any, b: any) => { return b.value - a.value; })
    acc = acc.sort((a: any, b: any) => { return b.value - a.value; })
    speed = speed.sort((a: any, b: any) => { return b.value - a.value; })
    star = star.sort((a: any, b: any) => { return b.value - a.value; })

    aim.forEach((a: any, n: number) => {
        aim_avg += a.value * Math.pow(0.95, n);
    })
    acc.forEach((a: any, n: number) => {
        acc_avg += a.value * Math.pow(0.95, n);
    })
    speed.forEach((a: any, n: number) => {
        speed_avg += a.value * Math.pow(0.95, n);
    })
    star.forEach((a: any) => star_avg += a.value);

    let skills: all_skills = {
        aim: aim,
        acc: acc,
        speed: speed,
        star: star,
        aim_avg: aim_avg,
        acc_avg: acc_avg,
        speed_avg: speed_avg,
        star_avg: star_avg
    }

    return skills;

}