import asyncBatch from "async-batch";
import { OsuScore } from "../../interfaces/OsuScore";
import score from "../../models/score";
import { downloadAndOverrideBeatmap } from "../beatmaps/downloadbeatmap";
import { simulateArgs } from "../pp/simulate";
import { simulateFull } from "../pp/simulatefull";

export interface skills {
    aim: number;
    acc: number;
    speed: number;
}

export interface skill_score {
    value: number,
    score: OsuScore,
}

export interface skill_type {
    scores: skill_score[],
    label: string,
    average: number,
}

// based on bath values just slightly tweaked.
const ACC_NERF: number = 1.4;
const AIM_NERF: number = 2.6;
const SPEED_NERF: number = 2.4;
const MOVEMENT_NERF: number = 0;
const DIFFICULTY_NERF: number = 0;

export async function getAllSkills(top_100: any) {

    if (top_100 == null) {
        return;
    }

    const dopwnload_beatmaps = asyncBatch(top_100,
        (task: any) => new Promise(
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

    let aim: skill_score[] = [];
    let acc: skill_score[] = [];
    let speed: skill_score[] = [];
    let star: skill_score[] = [];
    let difficulty: skill_score[] = [];

    await asyncBatch(top_100,
        (task: any) => new Promise(
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
                                const y = Math.min(Math.pow(((task.value.accuracy * 100) / 17.0), 2.6), 100.00)

                                const acc_: any = Math.pow(y / 60.0, 1.5);

                                const acc_val = Math.pow(value.star, acc_)
                                    * Math.pow(task.value.beatmap.accuracy / 7.0, 0.25)
                                    * Math.pow(task.value.max_combo / 2000.0, 0.15)
                                    * ACC_BUFF;

                                // Restrict output to not reach above 100!
                                acc.push({ value: acc_val, score: task.value });
                                difficulty.push({ value: value.pp_strain / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: value.star, score: task.value });
                                break;

                            }
                            case "fruits": {

                                const ACC_BUFF: number = 1.95;
                                const DIFFICULTY_NERF: number = 0.75;

                                // This is based of bathbot but changed to have a less expodentional growth
                                // Bath: https://www.desmos.com/calculator/b30p1awwft?lang=de also dont get why you dont add it to atleast rech 100...
                                // Mine: https://www.desmos.com/calculator/6itbeh8lhl?lang=de

                                // Restrict the expodentional value to 100, otherwise it can be 100.192
                                const y = Math.min(Math.pow(((task.value.accuracy * 100) / 17.0), 2.6), 100.00)

                                const acc_: any = Math.pow(y / 60.0, 1.5);

                                const acc_val = Math.pow(value.star, acc_)
                                    * Math.pow(task.value.beatmap.accuracy / 7.0, 0.25)
                                    * Math.pow(task.value.max_combo / 2000.0, 0.15)
                                    * ACC_BUFF;

                                // Restrict output to not reach above 100!
                                acc.push({ value: acc_val, score: task.value });
                                difficulty.push({ value: value.pp_strain / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: value.star, score: task.value });
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

    let skills: skill_type[] = [];

    skills.push(addSkill("Star", star));
    skills.push(addSkill("Aim", aim));
    skills.push(addSkill("Accuracy", acc));
    skills.push(addSkill("Speed", speed));
    skills.push(addSkill("Strain", difficulty));


    return skills;

}


// sorry bath i stole this. working on slightly altering this
export function normalise(value: number): number {
    let factor = (8.0 / (value / 72.0 + 8.0))

    factor = Math.pow(factor, 10)

    const res = -101.0 * factor + 101.0;

    return res;
}

function addSkill(label: string, scores: skill_score[]): skill_type {

    let avg = 0;
    let weight_sum = 0;

    scores = scores.sort((a: skill_score, b: skill_score) => { return b.value - a.value; })

    if (label !== "Star") {
        for (let i = 0; i < 100; i++) {
            const weight = Math.pow(0.95, i);
            if (scores[i] !== undefined)
                avg += scores[i].value * weight;
            weight_sum += weight;
        }
        avg = normalise(avg / weight_sum);
    } else {
        scores.forEach((score: skill_score) => avg += score.value);
        avg = avg / scores.length;
    }

    return { label: label, scores: scores, average: avg };

}