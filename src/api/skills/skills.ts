import asyncBatch from "async-batch";
import { downloadAndOverrideBeatmap } from "../beatmaps/downloadbeatmap";
import { loaddifficulty } from "../pp/db/loaddifficutly";
import { simulate, simulateArgs } from "../pp/simulate";
import { simulateFull } from "../pp/simulatefull";

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

const ACC_NERF: number = 1.4;
const AIM_NERF: number = 2.5;
const SPEED_NERF: number = 2.3;

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

    if (check_which_won === "skip") {
        return undefined;
    }

    let aim: Array<number> = [];
    let acc: Array<number> = [];
    let speed: Array<number> = [];

    let aimpp: number = 0;
    let accpp: number = 0;
    let speedpp: number = 0;

    const generateSkills = await asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {

                    let sim: simulateArgs = {
                        mode: task.value.mode,
                        checksum: task.value.beatmap.checksum,
                        mapid: task.value.beatmap.id,
                        mods: task.value.mods,
                        combo: task.value.max_combo,
                        great: task.value.statistics.count_300,
                        goods: task.value.statistics.count_100,
                        mehs: task.value.statistics.count_50,
                        misses: task.value.statistics.count_miss,
                        score: task.value.score

                    };

                    simulateFull(sim).then((value: any) => {

                        aim.push(normalise(value.pp_aim / AIM_NERF));
                        acc.push(normalise(value.pp_acc / ACC_NERF));
                        speed.push(normalise(value.pp_speed / SPEED_NERF));

                        return resolve(value);

                    })

                } else {
                    return resolve(null);
                }
            }
        ),
        10,
    );

    let weight_sum = 0;

    for (let i = 0; i < 100; i++) {
        let weight = Math.pow(0.95, i);
        aimpp += aim[i] * weight;
        accpp += acc[i] * weight;
        speedpp += speed[i] * weight;
        weight_sum += weight;
    }

    aimpp = normalise(aimpp / weight_sum);
    accpp = normalise(accpp / weight_sum);
    speedpp = normalise(speedpp / weight_sum);

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

    if (check_which_won === "skip") {
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

                    let sim: simulateArgs = {
                        mode: task.value.mode,
                        checksum: task.value.beatmap.checksum,
                        mapid: task.value.beatmap.id,
                        mods: task.value.mods,
                        combo: task.value.max_combo,
                        great: task.value.statistics.count_300,
                        goods: task.value.statistics.count_100,
                        mehs: task.value.statistics.count_50,
                        misses: task.value.statistics.count_miss,
                        score: task.value.score
                    };

                    simulateFull(sim).then((value: any) => {

                        aim.push({value: normalise(value.pp_aim / AIM_NERF), score: task.value});
                        acc.push({value: normalise(value.pp_acc / ACC_NERF), score: task.value});
                        speed.push({value: normalise(value.pp_speed / SPEED_NERF), score: task.value});
                        star.push({value: value.star, score: task.value});

                        return resolve(value);

                    })

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

    let weight_sum = 0;

    for (let i = 0; i < 100; i++) {
        let weight = Math.pow(0.95, i);
        aim_avg += aim[i].value * weight;
        acc_avg += acc[i].value * weight;
        speed_avg += speed[i].value * weight;
        weight_sum += weight;
    }

    aim_avg = normalise(aim_avg / weight_sum);
    acc_avg = normalise(acc_avg / weight_sum);
    speed_avg = normalise(speed_avg / weight_sum);

    star.forEach((a: any) => star_avg += a.value);
    star_avg = star_avg / star.length;

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

function normalise(value: number) {
    let factor = (8.0 / (value / 72.0 + 8.0))

    factor = Math.pow(factor, 10)

    let res = -101.0 * factor + 101.0;

    return res;
};
