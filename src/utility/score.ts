import { Statistics } from "osu-api-extended/dist/types/v2/scores_list_solo_scores";
import { replaceDots } from "./comma";
import { Difficulty, DifficultyAttributes, GameMode } from "@kotrikd/rosu-pp";

export function buildModString(play: any) {

    if (!play) {
        return "";
    }

    const mods: Array<any> = play.mods;
    let modString: any = "+";
    mods.forEach(m => { modString += `${m.acronym}${m.settings != undefined && m.settings.speed_change != undefined ? "(" + m.settings.speed_change + "x)" : ""}` });

    return modString;
}

export function buildStatisticString(play: any): string {
    const statistics: Statistics = play.statistics;

    // Determine values conditionally based on ruleset_id
    const values = [
        play.ruleset_id === 3 ? (statistics.perfect ?? 0) : undefined,
        statistics.great ?? 0,
        play.ruleset_id === 3 ? (statistics.good ?? 0) : undefined,
        statistics.ok ?? 0,
        statistics.meh ?? 0,
        statistics.miss ?? 0
    ];

    // Filter out undefined values and join them with "/"
    return "{" + values.filter(value => value !== undefined).join('/') + "}";
}

export function buildStatisticNoMissString(play: any): string {
    const statistics: Statistics = play.statistics;

    // Determine values conditionally based on ruleset_id, excluding `miss`
    let values: any[] = [
        play.ruleset_id === 3 ? (statistics.perfect ?? 0) : undefined,
        statistics.great ?? 0,
        play.ruleset_id === 3 ? (statistics.good ?? 0) : undefined,
        statistics.ok ?? 0,
        statistics.meh ?? 0
    ];

    // Add `miss` to the first defined value if `miss` exists
    const missValue = statistics.miss ?? 0;
    if (missValue > 0) {
        for (let i = 0; i < values.length; i++) {
            if (values[i] !== undefined) {
                values[i] += missValue;
                break;
            }
        }
    }

    // Filter out undefined values and join them with "/"
    return "{" + values.filter(value => value !== undefined).join('/') + "}";
}

export function getScore(play: any): number {

    let score = play.total_score;

    if (play.ruleset_id == 0 && play.legacy_score_id != undefined) {
        score = play.legacy_total_score;
    }

    return score
}

export function buildMapInfo(stats: any, difficulty: DifficultyAttributes) {

    let info = "";

    switch (difficulty.mode) {
        case GameMode.Osu:
        case GameMode.Catch:
            info = `Combo: \`${difficulty.maxCombo ?? 0}x\` Stars: \`${(difficulty.stars ?? 0).toFixed(2)}★\`\n` +
                `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${difficulty.nObjects ?? 0}\`\n` +
                `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${(difficulty.ar ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${(difficulty.od ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${(difficulty.hp ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``;
            break;
        case GameMode.Mania:
            info = `Stars: \`${difficulty.stars.toFixed(2)}★\`\n` +
                `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${difficulty.nObjects ?? 0}\`\n` +
                `Keycount:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${(difficulty.od ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${(difficulty.hp ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``;
            break;
        case GameMode.Taiko:
            info = `Stars: \`${difficulty.stars.toFixed(2)}★\` Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${difficulty.nObjects ?? 0}\`\n` +
                `OD:\`${(stats.cs ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${(stats.hp ?? 0).toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``;
            break;

    }

    return info;
}


export function buildScoreString(play: any): string {

    let score = getScore(play);

    return replaceDots(score);
}
