import * as rosu from "@kotrikd/rosu-pp";
import * as fs from "fs";

export async function difficulty(mapid: any, checksum: any, mode: number, mods: Array<any>) {

    const bytes = fs.readFileSync(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`);

    // Parse the map.
    let map = new rosu.Beatmap(bytes);

    map.convert(mode);

    const maxAttrs = new rosu.Performance({ mods: mods }).calculate(map);

    // const map_difficulty: any = await ppcalc.difficutly(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);

    map.free();

    return maxAttrs.difficulty
}