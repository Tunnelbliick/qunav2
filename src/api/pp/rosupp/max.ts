import { arraytoBinary } from "../../../utility/parsemods";

const ppcalc = require('quna-pp');

export async function max(mapid: number, checksum: string, mode: string, mods?: string[]): Promise<number> {

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