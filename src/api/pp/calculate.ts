import { arraytoBinary } from "../osu/utility/parsemods";
import * as rosu from "@kotrikd/rosu-pp";
import * as fs from "fs";
import { difficulty } from "./difficulty";

const missArray: number[] = [0, 1, 5, 10, 20];
const AccArray: number[] = [100.0, 99.0, 97.0, 95.0];

export async function calculate(mapid: any, checksum: any, mode: number, mods?: any) {

    //const modbinary = arraytoBinary(mods);

    const map_bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);
    let map = new rosu.Beatmap(map_bytes);

    map.convert(mode);

    let values: any = { difficulty: undefined, pp: undefined };
    let map_pp: any = {};

    const maxAttrs = new rosu.Performance({ mods: mods }).calculate(map);

    for (const miss of missArray) {

        if (!map_pp[miss]) {
            map_pp[miss] = {}; // Initialize map_pp[miss] if it doesn't exist
        }

        for (const acc of AccArray) {
            const currAttrs = new rosu.Performance({
                mods: mods,
                accuracy: acc,
                misses: miss,
                hitresultPriority: rosu.HitResultPriority.BestCase
            }).calculate(maxAttrs);

            map_pp[miss][acc] = currAttrs.pp;

        }
    }

    values.difficulty = maxAttrs.difficulty.toJSON();
    values.pp = map_pp;

    maxAttrs.difficulty.free();
    map.free();

    return values;
}
