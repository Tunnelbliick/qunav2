import asyncBatch from "async-batch";
import { downloadAndOverrideBeatmap } from "../beatmaps/downloadbeatmap";
import { simulateArgs } from "../pp/simulate";
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

// based on bath values just slightly tweaked.
const ACC_NERF: number = 1.4;
const AIM_NERF: number = 2.6;
const SPEED_NERF: number = 2.4;
const MOVEMENT_NERF: number = 0;
const DIFFICULTY_NERF: number = 0;

export async function getTotalSkills(top_100: any) {

    if (top_100 == null) {
        return;
    }

    const dopwnload_beatmaps = asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {
                    const dest = `${process.env.FOLDER_TEMP}${task.value.beatmap.id}_${task.value.beatmap.checksum}.osu`;
                    downloadAndOverrideBeatmap('https://osu.ppy.sh/osu/', dest, task.value.beatmap.id).then(() => { return resolve(true) });
                } else {
                    return resolve(null);
                }
            }
        ),
        2,
    );

    const skip = new Promise((res) => setTimeout(() => res("skip"), 5000));

    const check_which_won = await Promise.race([skip, dopwnload_beatmaps]);

    if (check_which_won === "skip") {
        return undefined;
    }

    let aim: Array<number> = [];
    let acc: Array<number> = [];
    let speed: Array<number> = [];
    let strain: Array<number> = [];
    let difficulty: Array<number> = [];

    let aimpp: number = 0;
    let accpp: number = 0;
    let speedpp: number = 0;
    let strainpp: number = 0;
    let difficultypp: number = 0;

    const generateSkills = await asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {

                    const sim: simulateArgs = {
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

                        switch (task.value.mode) {

                            case "osu": {

                                const ACC_NERF: number = 1.4;
                                const AIM_NERF: number = 2.6;
                                const SPEED_NERF: number = 2.4;

                                aim.push(value.pp_aim / AIM_NERF);
                                acc.push(value.pp_acc / ACC_NERF);
                                speed.push(value.pp_speed / SPEED_NERF);
                                break;
                            }
                            case "taiko": {

                                const ACC_NERF: number = 1.15;
                                const DIFFICULTY_NERF: number = 2.8;

                                acc.push(value.pp_acc / ACC_NERF);
                                difficulty.push(value.pp_strain / DIFFICULTY_NERF);
                                break;

                            }
                            case "mania": {

                                const ACC_BUFF: number = 2.1;
                                const DIFFICULTY_NERF: number = 0.6;

                                let acc_: any = Math.pow(Math.pow((task.value.accuracy / 36.0), 4.5) / 60.0, 1.5);

                                let acc_val = Math.pow(value.star, acc_)
                                    * Math.pow(task.value.od / 7.0, 0.25)
                                    * Math.pow(0 / 2000.0, 0.15)
                                    * ACC_BUFF;

                                acc.push(acc_val);
                                difficulty.push(value.pp_strain / DIFFICULTY_NERF);
                                break;

                            }

                        }

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

    aim = aim.sort((a: any, b: any) => { return b - a; })
    acc = acc.sort((a: any, b: any) => { return b - a; })
    speed = speed.sort((a: any, b: any) => { return b - a; })
    difficulty = difficulty.sort((a: any, b: any) => { return b - a; })
    strain = strain.sort((a: any, b: any) => { return b - a; })

    for (let i = 0; i < 100; i++) {
        const weight = Math.pow(0.95, i);
        aimpp += aim[i] * weight;
        accpp += acc[i] * weight;
        speedpp += speed[i] * weight;
        weight_sum += weight;
    }

    aimpp = normalise(aimpp / weight_sum);
    accpp = normalise(accpp / weight_sum);
    speedpp = normalise(speedpp / weight_sum);

    const skills: skills = {
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
                    const dest = `${process.env.FOLDER_TEMP}${task.value.beatmap.id}_${task.value.beatmap.checksum}.osu`;
                    downloadAndOverrideBeatmap('https://osu.ppy.sh/osu/', dest, task.value.beatmap.id).then(() => { return resolve(true) });
                } else {
                    return resolve(null);
                }
            }
        ),
        2,
    );

    const skip = new Promise((res) => setTimeout(() => res("skip"), 5000));

    const check_which_won = await Promise.race([skip, dopwnload_beatmaps]);

    if (check_which_won === "skip") {
        return undefined;
    }

    let aim: any = [];
    let acc: any = [];
    let speed: any = [];
    let star: any = [];
    let difficulty: any = [];
    let strain: any = [];

    const generateSkills = await asyncBatch(top_100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {

                    const sim: simulateArgs = {
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

                        switch (task.value.mode) {

                            case "osu": {

                                const ACC_NERF: number = 1.4;
                                const AIM_NERF: number = 2.6;
                                const SPEED_NERF: number = 2.4;

                                aim.push({ value: value.pp_aim / AIM_NERF, score: task.value });
                                acc.push({ value: value.pp_acc / ACC_NERF, score: task.value });
                                speed.push({ value: value.pp_speed / SPEED_NERF, score: task.value });
                                star.push({ value: value.star, score: task.value });
                                break;
                            }
                            case "taiko": {

                                const ACC_NERF: number = 1.15;
                                const DIFFICULTY_NERF: number = 2.8;

                                acc.push({ value: value.pp_acc / ACC_NERF, score: task.value });
                                difficulty.push({ value: value.pp_strain / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: value.star, score: task.value });
                                break;

                            }
                            case "mania": {

                                const ACC_BUFF: number = 1.95;
                                const DIFFICULTY_NERF: number = 0.75;

                                // This is based of bathbot but changed to have a less expodentional growth
                                // Bath: https://www.desmos.com/calculator/b30p1awwft?lang=de also dont get why you dont add it to atleast rech 100...
                                // Mine: https://www.desmos.com/calculator/6itbeh8lhl?lang=de

                                // Restrict the expodentional value to 100, otherwise it can be 100.192
                                let y = Math.min(Math.pow(((task.value.accuracy * 100) / 17.0), 2.6), 100.00)

                                let acc_: any = Math.pow(y / 60.0, 1.5);

                                let acc_val = Math.pow(value.star, acc_)
                                    * Math.pow(task.value.beatmap.accuracy / 7.0, 0.25)
                                    * Math.pow(task.value.max_combo / 2000.0, 0.15)
                                    * ACC_BUFF;

                                // Restrict output to not reach above 100!
                                acc.push({ value: acc_val, score: task.value });
                                difficulty.push({ value: value.pp_strain / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: value.star, score: task.value });
                                break;

                            }

                        }


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
    let difficulty_avg = 0;

    aim = aim.sort((a: any, b: any) => { return b.value - a.value; })
    acc = acc.sort((a: any, b: any) => { return b.value - a.value; })
    speed = speed.sort((a: any, b: any) => { return b.value - a.value; })
    difficulty = difficulty.sort((a: any, b: any) => { return b.value - a.value; })
    star = star.sort((a: any, b: any) => { return b.value - a.value; })

    let weight_sum = 0;

    for (let i = 0; i < 100; i++) {
        const weight = Math.pow(0.95, i);
        if (aim[i] !== undefined)
            aim_avg += aim[i].value * weight;
        if (acc[i] !== undefined)
            acc_avg += acc[i].value * weight;
        if (speed[i] !== undefined)
            speed_avg += speed[i].value * weight;
        if (difficulty[i] !== undefined)
            difficulty_avg += difficulty[i].value * weight;
        weight_sum += weight;
    }

    aim_avg = normalise(aim_avg / weight_sum);
    acc_avg = normalise(acc_avg / weight_sum);
    speed_avg = normalise(speed_avg / weight_sum);
    difficulty_avg = normalise(difficulty_avg / weight_sum);

    console.log(difficulty_avg);

    star.forEach((a: any) => star_avg += a.value);
    star_avg = star_avg / star.length;

    const skills: all_skills = {
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


// sorry bath i stole this. working on slightly altering this
export function normalise(value: number): number {
    let factor = (8.0 / (value / 72.0 + 8.0))

    factor = Math.pow(factor, 10)

    const res = -101.0 * factor + 101.0;

    return res;
}