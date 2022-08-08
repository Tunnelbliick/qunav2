import { arraytoBinary } from "../osu/utility/parsemods";

const ppcalc = require('quna-pp');

export async function difficulty(mapid: any, checksum: any, mode: any, mods: Array<any>) {

    let modbinary = arraytoBinary(mods);

    let map_difficulty: any = await ppcalc.difficutly(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);

    return map_difficulty
}