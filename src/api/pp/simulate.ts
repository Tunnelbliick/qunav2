import { ScoresDetails } from "osu-api-extended/dist/types/scores_details";
import { arraytoBinary } from "../osu/utility/parsemods";
import { Beatmap } from "osu-api-extended/dist/types/v2/beamaps_details_set";

const ppcalc = require('quna-pp');

export interface simulateArgs {
    mapid: string;
    checksum: string;
    misses: number;
    mehs: number;
    goods: number;
    great: number;
    combo: number;
    score: number;
    mode: string;
    mods: string[];

}

export async function simulateRecentPlay(recentplay: ScoresDetails) {

    const mapid = recentplay.beatmap.id;
    const checksum = recentplay.beatmap.checksum;
    const misses = recentplay.statistics.miss;
    const mehs = recentplay.statistics.meh;
    const goods = recentplay.statistics.ok;
    const great = recentplay.statistics.great;
    const combo = recentplay.max_combo;
    const score = recentplay.total_score;
    const mode = recentplay.ruleset_id;
    const mods = recentplay.mods

    const modbinary = arraytoBinary(mods);

    let map_pp = null;
    switch (mode) {
        case 3:
            map_pp = await ppcalc.simulatemania(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, score);
            break;
        default:
            map_pp = await ppcalc.simulatestd(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, great, goods, mehs, misses, combo);
            break;
    }

    if(map_pp === Infinity) {
        map_pp = 0;
    }

    return map_pp
}

export async function simulateRecentPlayFC(recentplay: ScoresDetails, beatmap: Beatmap) {

    const mapid = recentplay.beatmap.id;
    const checksum = recentplay.beatmap.checksum;
    const misses = 0;
    const mehs = recentplay.statistics.meh;
    const goods = recentplay.statistics.ok;
    const great = 0;
    const combo = beatmap.max_combo != null ? beatmap.max_combo : 999999;
    const score = recentplay.total_score;
    const mode = recentplay.ruleset_id;
    const mods = recentplay.mods

    const modbinary = arraytoBinary(mods);

    let map_pp = null;
    switch (mode) {
        case 0:
            map_pp = await ppcalc.simulatemania(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, score);
            break;
        default:
            map_pp = await ppcalc.simulatestd(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, great, goods, mehs, misses, combo);
            break;
    }

    return map_pp
}

export async function simulate(args: simulateArgs) {

    const modbinary = arraytoBinary(args.mods);

    let map_pp = null;
    switch (args.mode) {
        case "mania":
            map_pp = await ppcalc.simulatemania(`${process.env.FOLDER_TEMP}${args.mapid}_${args.checksum}.osu`, modbinary, args.score);
            break;
        default:
            map_pp = await ppcalc.simulatestd(`${process.env.FOLDER_TEMP}${args.mapid}_${args.checksum}.osu`, modbinary, args.great, args.goods, args.mehs, args.misses, args.combo);
            break;
    }

    return map_pp
}

export async function simulateFC(args: simulateArgs) {

    const modbinary = arraytoBinary(args.mods);

    let map_pp = null;
    switch (args.mode) {
        case "mania":
            map_pp = await ppcalc.simulatemania(`${process.env.FOLDER_TEMP}${args.mapid}_${args.checksum}.osu`, modbinary, args.score);
            break;
        default:
            map_pp = await ppcalc.simulatestd(`${process.env.FOLDER_TEMP}${args.mapid}_${args.checksum}.osu`, modbinary, 0, args.goods, args.mehs, 0, args.combo);
            break;
    }

    return map_pp
}