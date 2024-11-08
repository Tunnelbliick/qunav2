import asyncBatch from "async-batch";
import { OsuScore } from "../../interfaces/OsuScore";
import { downloadAndOverrideBeatmap } from "../beatmaps/downloadbeatmap";
import { simulateArgs } from "../pp/simulate";
import { simulateFull } from "../pp/simulatefull";
import { scores_list_solo_scores_response } from "osu-api-extended/dist/types/v2/scores_list_solo_scores";
import { PerformanceAttributes } from "@kotrikd/rosu-pp";

export interface skills {
    aim: number;
    acc: number;
    speed: number;
}

export interface skill_score {
    value: number,
    score: any,
}

export interface skill_type {
    scores: skill_score[],
    label: string,
    average: number,
}

export interface top100 {
    position: number,
    value: any
}

export async function getAllSkills(top_100: top100[]) {

    if (top_100 == null) {
        return;
    }

    const dopwnload_beatmaps = asyncBatch(top_100,
        (task: top100) => new Promise(
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

    const aim: skill_score[] = [];
    const acc: skill_score[] = [];
    const speed: skill_score[] = [];
    const star: skill_score[] = [];
    const difficulty: skill_score[] = [];

    await asyncBatch(top_100,
        (task: top100) => new Promise(
            async (resolve) => {
                if (task.value != null && task.value.beatmap != null) {

                    let play = task.value;

                    const sim: simulateArgs = {
                        mode: play.ruleset_id,
                        checksum: play.beatmap.checksum,
                        mapid: play.beatmap.id,
                        mods: play.mods,
                        combo: play.max_combo,
                        perfect: play.statistics.perfect ?? 0,
                        great: play.statistics.great ?? 0,
                        ok: play.statistics.ok ?? 0,
                        goods: play.statistics.good ?? 0,
                        mehs: play.statistics.meh ?? 0,
                        misses: play.statistics.miss ?? 0,
                        score: play.total_score
                    };

                    simulateFull(sim).then((value: any) => {

                        switch (play.ruleset_id) {

                            case 0: {

                                const ACC_NERF: number = 1.4;
                                const AIM_NERF: number = 2.6;
                                const SPEED_NERF: number = 2.4;

                                aim.push({ value: (value.ppAim ?? 0) / AIM_NERF, score: task.value });
                                acc.push({ value: (value.ppAccuracy ?? 0) / ACC_NERF, score: task.value });
                                speed.push({ value: (value.ppSpeed ?? 0) / SPEED_NERF, score: task.value });
                                star.push({ value: (value.difficulty.stars ?? 0), score: task.value });
                                break;
                            }
                            case 1: {

                                const ACC_NERF: number = 1.15;
                                const DIFFICULTY_NERF: number = 2.8;

                                acc.push({ value: (value.ppAccuracy ?? 0) / ACC_NERF, score: task.value });
                                difficulty.push({ value: (value.ppDifficulty ?? 0) / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: (value.difficulty.stars ?? 0), score: task.value });
                                break;

                            }
                            case 3: {

                                const ACC_BUFF: number = 1.95;
                                const DIFFICULTY_NERF: number = 0.75;

                                // This is based of bathbot but changed to have a less expodentional growth
                                // Bath: https://www.desmos.com/calculator/b30p1awwft?lang=de also dont get why you dont add it to atleast rech 100...
                                // Mine: https://www.desmos.com/calculator/6itbeh8lhl?lang=de

                                // Restrict the expodentional value to 100, otherwise it can be 100.192
                                const y = Math.min(Math.pow(((task.value.accuracy * 100) / 17.0), 2.6), 100.00)

                                const acc_: number = Math.pow(y / 60.0, 1.5);

                                const acc_val = Math.pow((value.difficulty.stars ?? 0), acc_)
                                    * Math.pow(task.value.beatmap.accuracy / 7.0, 0.25)
                                    * Math.pow(task.value.max_combo / 2000.0, 0.15)
                                    * ACC_BUFF;

                                // Restrict output to not reach above 100!
                                acc.push({ value: acc_val, score: task.value });
                                difficulty.push({ value: (value.ppDifficulty ?? 0) / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: (value.difficulty.stars ?? 0), score: task.value });
                                break;

                            }
                            case 2: {

                                const ACC_BUFF: number = 1.95;
                                const DIFFICULTY_NERF: number = 0.75;

                                // This is based of bathbot but changed to have a less expodentional growth
                                // Bath: https://www.desmos.com/calculator/b30p1awwft?lang=de also dont get why you dont add it to atleast rech 100...
                                // Mine: https://www.desmos.com/calculator/6itbeh8lhl?lang=de

                                // Restrict the expodentional value to 100, otherwise it can be 100.192
                                const y = Math.min(Math.pow(((task.value.accuracy * 100) / 17.0), 2.6), 100.00)

                                const acc_: number = Math.pow(y / 60.0, 1.5);

                                const acc_val = Math.pow((value.difficulty.stars ?? 0), acc_)
                                    * Math.pow(task.value.beatmap.accuracy / 7.0, 0.25)
                                    * Math.pow(task.value.max_combo / 2000.0, 0.15)
                                    * ACC_BUFF;

                                // Restrict output to not reach above 100!
                                acc.push({ value: acc_val, score: task.value });
                                difficulty.push({ value: (value.ppDifficulty ?? 0) / DIFFICULTY_NERF, score: task.value });
                                star.push({ value: (value.difficulty.stars ?? 0), score: task.value });
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

    const skills: skill_type[] = [];

    skills.push(addSkill("Star", star));
    skills.push(addSkill("Aim", aim));
    skills.push(addSkill("Acc", acc));
    skills.push(addSkill("Speed", speed));
    skills.push(addSkill("Strain", difficulty));


    return skills;

}


// sorry bath i stole this. working on slightly altering this
export function normalise(value: number): number {
    let factor = (8.0 / (value / 72.0 + 8.0))

    factor = Math.pow(factor, 10)

    const res = -100.0 * factor + 100.0;

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