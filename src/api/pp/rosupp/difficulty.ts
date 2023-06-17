import { difficulty } from "../../../interfaces/pp/difficulty";
import { arraytoBinary } from "../../../utility/parsemods";

const ppcalc = require('quna-pp');

export async function getBeatmapDifficulty(mapid: number, checksum: string, mods: string[]) {

    const modbinary = arraytoBinary(mods);

    const map_difficulty: difficulty = await ppcalc.difficutly(`${process.env.FOLDER_TEMP}${mapid}_${checksum}.osu`, modbinary);

    return map_difficulty
}