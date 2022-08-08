import { arraytoBinary } from "../osu/utility/parsemods";

const ppcalc = require('quna-pp');

export class simulateArgs {
    mapid: any;
    checksum: any;
    misses: any;
    mehs: any;
    goods: any;
    great: any;
    combo: any;
    score: any;
    mode: any;
    mods: any;

}

export async function simulateRecentPlay(recentplay: any) {

    const mapid = recentplay.beatmap.id;
    const checksum = recentplay.beatmap.checksum;
    const misses = recentplay.statistics.count_miss;
    const mehs = recentplay.statistics.count_50;
    const goods = recentplay.statistics.count_100;
    const great = recentplay.statistics.count_300;
    const combo = recentplay.max_combo;
    const score = recentplay.score;
    const mode = recentplay.mode;
    const mods = recentplay.mods

    let modbinary = arraytoBinary(mods);

    let map_pp = null;
    switch (mode) {
        case "mania":
            map_pp = await ppcalc.simulatemania(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, score);
            break;
        default:
            map_pp = await ppcalc.simulatestd(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, great, goods, mehs, misses, combo);
            break;
    }

    return map_pp
}

export async function simulateRecentPlayFC(recentplay: any, beatmap: any) {

    const mapid = recentplay.beatmap.id;
    const checksum = recentplay.beatmap.checksum;
    const misses = 0;
    const mehs = recentplay.statistics.count_50;
    const goods = recentplay.statistics.count_100;
    const great = 0;
    const combo = beatmap.max_combo;
    const score = recentplay.score;
    const mode = recentplay.mode;
    const mods = recentplay.mods

    let modbinary = arraytoBinary(mods);

    let map_pp = null;
    switch (mode) {
        case "mania":
            map_pp = await ppcalc.simulatemania(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, score);
            break;
        default:
            map_pp = await ppcalc.simulatestd(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary, great, goods, mehs, misses, combo);
            break;
    }

    return map_pp
}

export async function simulate(args: simulateArgs) {

    let modbinary = arraytoBinary(args.mods);

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

    let modbinary = arraytoBinary(args.mods);

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