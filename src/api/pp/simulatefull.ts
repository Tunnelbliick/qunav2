import { arraytoBinary } from "../osu/utility/parsemods";
import { simulateArgs } from "./simulate";
import * as rosu from "@kotrikd/rosu-pp";
import * as fs from "fs";

export async function simulateFull(args: simulateArgs) {

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

    return currAttrs.toJSON();
}
