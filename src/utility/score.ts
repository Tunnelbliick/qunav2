import { Statistics } from "osu-api-extended/dist/types/v2/scores_list_solo_scores";
import { replaceDots } from "./comma";

export function buildModString(play: any) {

    if(!play) {
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


export function buildScoreString(play: any): string {

    let score = play.total_score;

    if (play.ruleset_id == 0 && play.legacy_score_id != undefined) {
        score = play.legacy_total_score;
    }

    return replaceDots(score);
}
