import { arraytoBinary } from "../osu/utility/parsemods";

const ppcalc = require('quna-pp');

export async function calcualte(mapid: any, checksum: any, mode: any, mods?: any) {

    let modbinary = arraytoBinary(mods);

    let map_pp = null;

    switch (mode) {
        case "osu":
            map_pp = ppcalc.calculate_map_pp(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);
            break;
        case "mania":
            map_pp = ppcalc.calculate_mania_map_pp(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);
            break;
        default:
            map_pp = ppcalc.calculate_map_pp(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);
            break;
    }

    return map_pp;
}