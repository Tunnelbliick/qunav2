import { arraytoBinary } from "../osu/utility/parsemods";
import { modeIntToMode } from "../osu/utility/utility";

import * as rosu from "@kotrikd/rosu-pp";
import * as fs from "fs";

export interface simulateArgs {
    mapid: string;
    checksum: string;
    misses: number;
    mehs: number;
    goods: number;
    ok: number;
    perfect: number;
    great: number;
    combo: number;
    score: number;
    mode: number;
    mods: any[];

}

export async function simulateRecentPlay(recentplay: any) {

    const mapid = recentplay.beatmap.id;
    const checksum = recentplay.beatmap.checksum;
    const miss = recentplay.statistics.miss ?? 0;
    const meh = recentplay.statistics.meh ?? 0;
    const ok = recentplay.statistics.ok ?? 0;
    const great = recentplay.statistics.great ?? 0;
    const good = recentplay.statistics.good ?? 0;
    const perfect = recentplay.statistics.perfect ?? 0;
    const combo = recentplay.max_combo;
    const mods = recentplay.mods;

    const bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);

    // Parse the map.
    let map = new rosu.Beatmap(bytes);

    // Optionally convert the beatmap to a specific mode.
    map.convert(recentplay.ruleset_id);

    const currAttrs = new rosu.Performance({
        mods: mods, // Must be the same as before in order to use the previous attributes!
        misses: miss,
        n300: great,
        n100: ok,
        n50: meh,
        nGeki: perfect,
        nKatu: good,
        combo: combo,
        hitresultPriority: rosu.HitResultPriority.BestCase,
    }).calculate(map);

    map.free();

    return currAttrs.pp;

}

const missReduction = [1, 2, 5, 9999];

export async function simulateRecentPlayFC(recentplay: any, beatmap: any) {

    const mapid = recentplay.beatmap.id;
    const checksum = recentplay.beatmap.checksum;
    const meh = recentplay.statistics.meh ?? 0;
    const ok = recentplay.statistics.ok ?? 0;
    const great = 0;
    const good = recentplay.statistics.good ?? 0;
    const perfect = recentplay.statistics.perfect ?? 0;
    const combo = recentplay.max_combo;
    const mods = recentplay.mods

    const bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);

    // Parse the map.
    let map = new rosu.Beatmap(bytes);

    // Optionally convert the beatmap to a specific mode.
    map.convert(recentplay.ruleset_id);

    const maxAttrs = new rosu.Performance({ mods: mods }).calculate(map);

    let returnpp: any = 0;

    if (recentplay.ruleset_id == 0) {

        const miss = recentplay.statistics.miss ?? 0;

        let ppReturn: any[] = [];

        for (let reducer of missReduction) {

            let missCount = Math.max(miss - reducer, 0)

            const currAttrs = new rosu.Performance({
                mods: mods, // Must be the same as before in order to use the previous attributes!
                misses: missCount,
                n300: great,
                n100: ok,
                n50: meh,
                nGeki: perfect,
                nKatu: good,
                combo: combo,
                hitresultPriority: rosu.HitResultPriority.BestCase,
            }).calculate(maxAttrs);

            ppReturn[reducer] = currAttrs.pp;
        }

        returnpp = ppReturn;
    } else {

        const miss = 0;

        const currAttrs = new rosu.Performance({
            mods: mods, // Must be the same as before in order to use the previous attributes!
            misses: miss,
            n300: great,
            n100: ok,
            n50: meh,
            nGeki: perfect,
            nKatu: good,
            combo: combo,
            hitresultPriority: rosu.HitResultPriority.BestCase,
        }).calculate(maxAttrs);

        returnpp = currAttrs.pp;
    }

    map.free();

    return returnpp;
}

export async function simulate(args: simulateArgs) {

    const mapid = args.mapid;
    const checksum = args.checksum;
    const miss = args.misses ?? 0;
    const meh = args.mehs ?? 0;
    const ok = args.goods ?? 0;
    const great = args.great ?? 0;
    const good = args.goods ?? 0;
    const perfect = args.perfect ?? 0;
    const combo = args.combo;
    const mods = args.mods;

    const bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);

    // Parse the map.
    let map = new rosu.Beatmap(bytes);

    // Optionally convert the beatmap to a specific mode.
    let mode = 0;

    map.convert(mode);

    const currAttrs = new rosu.Performance({
        mods: mods, // Must be the same as before in order to use the previous attributes!
        misses: miss,
        n300: great,
        n100: ok,
        n50: meh,
        nGeki: perfect,
        nKatu: good,
        combo: combo,
        hitresultPriority: rosu.HitResultPriority.BestCase,
    }).calculate(map);

    map.free();

    return currAttrs.pp;
}

export async function simulateFC(args: simulateArgs) {

    const mapid = args.mapid;
    const checksum = args.checksum;
    const miss = 0;
    const meh = args.mehs ?? 0;
    const ok = args.goods ?? 0;
    const great = 0;
    const good = args.goods ?? 0;
    const perfect = args.perfect ?? 0;
    const combo = args.combo;
    const mods = args.mods;

    const bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);

    // Parse the map.
    let map = new rosu.Beatmap(bytes);

    // Optionally convert the beatmap to a specific mode.
    let mode = 0;

    map.convert(mode);

    const currAttrs = new rosu.Performance({
        mods: mods, // Must be the same as before in order to use the previous attributes!
        misses: miss,
        n300: great,
        n100: ok,
        n50: meh,
        nGeki: perfect,
        nKatu: good,
        combo: combo,
        hitresultPriority: rosu.HitResultPriority.BestCase,
    }).calculate(map);

    map.free();

    return currAttrs.pp;
}