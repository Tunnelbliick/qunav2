import { arraytoBinary } from "../osu/utility/parsemods";
import { simulateArgs } from "./simulate";

const ppcalc = require('quna-pp');

export async function simulateFull(args: simulateArgs) {

    const modbinary = arraytoBinary(args.mods);

    let map_pp = null;
    switch (args.mode) {
        case "mania":
            map_pp = await ppcalc.simulatemania_full(`${process.env.FOLDER_TEMP}${args.mapid}_${args.checksum}.osu`, modbinary, args.score);
            break;
        default:
            map_pp = await ppcalc.simulatestd_full(`${process.env.FOLDER_TEMP}${args.mapid}_${args.checksum}.osu`, modbinary, args.great, args.goods, args.mehs, args.misses, args.combo);
            break;
    }

    return map_pp
}
