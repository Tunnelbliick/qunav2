import { arraytoBinary } from "../osu/utility/parsemods";

const ppcalc = require('quna-pp');

export async function max(mapid: any, checksum: any, mode: any, mods?: Array<any>): Promise<number> {

    const modbinary = arraytoBinary(mods);

    let max_pp = undefined;

    switch (mode) {
        case "mania":
            max_pp = await ppcalc.max(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);
        default:
            max_pp = await ppcalc.max(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);
            break;
    }

    return max_pp;
}