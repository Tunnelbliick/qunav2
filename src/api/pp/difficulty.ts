import { arraytoBinary } from "../osu/utility/parsemods";

const ppcalc = require('quna-pp');

export async function difficulty(mapid: any, checksum: any, mode: any, mods: Array<any>) {

    const modbinary = arraytoBinary(mods);

    const map_difficulty: any = await ppcalc.difficutly(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);

    return map_difficulty
}