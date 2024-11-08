import * as rosu from "@kotrikd/rosu-pp";
import * as fs from "fs";

export async function max(mapid: any, checksum: any, mode: number, mods?: Array<any>): Promise<number> {

    const bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);

    // Parse the map.
    let map = new rosu.Beatmap(bytes);

    map.convert(mode);

    const maxAttrs = new rosu.Performance({ mods: mods }).calculate(map);

    map.free();

    return maxAttrs.pp;
}
