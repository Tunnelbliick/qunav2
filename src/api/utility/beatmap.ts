import { difficulty } from "../../interfaces/pp/difficulty";
import { parseNumber } from "./comma";
import { BeatmapStats } from "./stats";

export function buildBeatmapStats(stats: BeatmapStats, difficulty: difficulty | undefined) {

    if(difficulty === undefined) {
        return "";
    }

    const cs = parseNumber(stats.cs);
    const ar = parseNumber(difficulty.ar);
    const od = parseNumber(difficulty.od);
    const hp = parseNumber(difficulty.hp);
    const star = parseNumber(difficulty.star);

    return `CS:\`${cs}\` AR:\`${ar}\` OD:\`${od}\` HP:\`${hp}\` Stars: \`${star}★\``
}