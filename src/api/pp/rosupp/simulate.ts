import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { arraytoBinary } from "../../../utility/parsemods";
import { sentryError } from "../../utility/sentry";

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

export async function simulateRecentPlay(recentplay: OsuScore): Promise<number> {

    const args: simulateArgs = {
        mapid: recentplay.beatmap.id.toString(),
        checksum: recentplay.beatmap.checksum,
        misses: recentplay.statistics.count_miss,
        mehs: recentplay.statistics.count_50,
        goods: recentplay.statistics.count_100,
        great: recentplay.statistics.count_300,
        combo: recentplay.max_combo,
        score: recentplay.score,
        mode: recentplay.mode,
        mods: recentplay.mods
    }

    return simulate(args);
}

export async function simulateRecentPlayFC(recentplay: OsuScore): Promise<number> {

    const args: simulateArgs = {
        mapid: recentplay.beatmap.id.toString(),
        checksum: recentplay.beatmap.checksum,
        misses: 0,
        mehs: recentplay.statistics.count_50,
        goods: recentplay.statistics.count_100,
        great: 0,
        combo: recentplay.max_combo,
        score: recentplay.score,
        mode: recentplay.mode,
        mods: recentplay.mods
    }

    return simulateFC(args);

}

export async function simulate(args: simulateArgs): Promise<number> {

    try {
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

        return map_pp;

    } catch (err: any) {
        sentryError(err);
    }

    return 0;
}

export async function simulateFC(args: simulateArgs): Promise<number> {

    try {

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

    } catch (err: any) {
        sentryError(err);
    }

    return 0;
}