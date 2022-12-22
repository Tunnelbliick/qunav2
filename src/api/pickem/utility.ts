import { ObjectId } from "mongoose";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import { Owc } from "../../interfaces/owc";
import { OwcGame } from "../../interfaces/owcgame";
import { PickemPrediction } from "../../interfaces/pickemPredictions";

const { getCode } = require('country-list');

country_overwrite();

export interface option {
    label: string,
    value: string,
    default?: boolean,
}

export interface embed_parameters {
    description: string,
    options: option[]
}

export function selectRound(owc_year: Owc): string[] {
    let select: string[] = ["1"];

    switch (owc_year.current_round) {
        case 1:
            select = ["1"];
            break;
        case 2:
            select = ["2", "-1"];
            break;
        case 3:
            select = ["3", "-2", "-3"];
            break;
        case 4:
            select = ["4", "-4", "-5"];
            break;
        case 5:
            select = ["5", "-6", "-7"];
            break;
        case 6:
            select = ["6", "-8"];
    }
    return select;
}

export function buildInitialPredictions(unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_map: Map<number, OwcGame>): embed_parameters {

    let winners = "";
    let losers = "";

    const options: option[] = [];

    let split_index = 0;
    let index = 0;

    unlocked.forEach((match: OwcGame) => {

        split_index++;

        let code1: string = getCode(match.team1_name === undefined ? "" : match.team1_name);
        let code2: string = getCode(match.team2_name === undefined ? "" : match.team2_name);

        if (code1 === undefined) {
            code1 = "TBD";
        }

        if (code2 === undefined) {
            code2 = "TBD";
        }

        code1 = code1.toLocaleLowerCase();
        code2 = code2.toLocaleLowerCase();

        if (+match.round > 0) {

            ({ winners, split_index } = buildWinners(winners, code1, code2, index, options, predictionMap, match, match_map, split_index));

        } else {

            ({ losers, split_index } = buildLosers(losers, code1, code2, index, options, predictionMap, match, match_map, split_index));

        }

        index++;

    });

    const description: string = `${winners}\n${losers}`;

    const embed_parameters: embed_parameters = {
        description: description,
        options: options
    }

    return embed_parameters;
}

function buildLosers(losers: string, code1: string, code2: string, index: number, options: option[], predictionMap: Map<ObjectId, PickemPrediction>, match: OwcGame, match_map: Map<number, OwcGame>, split_index: number) {
    if (losers === "") {
        losers = "__**Losers Bracket**__\n";
    }

    const option = {
        label: `${code1} vs ${code2} (LS)`,
        value: `${index}`
    };

    options.push(option);

    const prediction = predictionMap.get(match.id);

    if (prediction != null) {
        losers += `${buildmatch(match, prediction.team1_score, prediction.team2_score, match_map)}`;
    } else {
        losers += `${buildmatch(match, undefined, undefined, match_map)}`;
    }

    if (split_index == 2) {
        losers += "\n";
        split_index = 0;
    }
    return { losers, split_index };
}

function buildWinners(winners: string, code1: string, code2: string, index: number, options: option[], predictionMap: Map<ObjectId, PickemPrediction>, match: OwcGame, match_map: Map<number, OwcGame>, split_index: number) {
    if (winners === "") {
        winners = "__**Winners Bracket**__\n";
    }

    const option: option = {
        label: `${code1} vs ${code2}`,
        value: `${index}`
    };

    options.push(option);

    const prediction = predictionMap.get(match.id);

    if (prediction != null) {
        winners += `${buildmatch(match, prediction.team1_score, prediction.team2_score, match_map)}`;
    } else {
        winners += `${buildmatch(match, undefined, undefined, match_map)}`;
    }

    if (split_index == 2) {
        winners += "\n";
        split_index = 0;
    }
    return { winners, split_index };
}

export function buildmatch(match: OwcGame, team1_score?: number, team2_score?: number, match_map?: Map<number, OwcGame>) {

    let code1: string = getCode(match.team1_name == undefined ? "" : match.team1_name)
    let code2: string = getCode(match.team2_name == undefined ? "" : match.team2_name)

    if (match.team1_name === undefined || match.team2_name === undefined) {
        if (match_map !== undefined)
            return buildWinnerOf(match, match_map, team1_score, team2_score);
    }

    if (code1 === undefined) {
        code1 = "AQ";
        match.team1_name = "TBD";
    }

    if (code2 === undefined) {
        code2 = "AQ";
        match.team2_name = "TBD";
    }

    code1 = code1.toLocaleLowerCase();
    code2 = code2.toLocaleLowerCase();

    let team1 = "";
    let team2 = "";

    if (team1_score === undefined || team2_score === undefined) {
        team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} **vs**`;
        team2 = ` ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
        return `${team1}${team2}`;
    }

    if (team1_score > team2_score) {
        team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${team1_score}** - `;
        team2 = `${team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
        return `${team1}${team2}`;
    } else {
        team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${team1_score} - `;
        team2 = `**${team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: \n`;
        return `${team1}${team2}`;
    }
}

export function buildWinnerOf(match: OwcGame, match_map: Map<number, OwcGame>, score1?: number, score2?: number) {

    let prio_match_1 = match.team1_name;
    let prio_match_2 = match.team2_name;

    if (prio_match_1 === undefined) {
        prio_match_1 = buildWinnerOfFlag(match_map.get(match.data.player1_prereq_match_id)!);
    } else {
        const code1: string = getCode(match.team1_name == undefined ? "" : match.team1_name)
        prio_match_1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name}`;
    }

    if (prio_match_2 === undefined) {
        prio_match_2 = buildWinnerOfFlag(match_map.get(match.data.player2_prereq_match_id)!);
    } else {
        const code1: string = getCode(match.team2_name == undefined ? "" : match.team2_name)
        prio_match_2 = `${match.team2_name} :flag_${code1.toLocaleLowerCase()}:`;
    }

    if (score1 === undefined || score2 === undefined) {
        return `${prio_match_1} **vs** ${prio_match_2} \n`;
    } else {
        if (score1 > score2) {
            return `${prio_match_1} **${score1}** - ${score2} ${prio_match_2} \n`;
        } else {
            return `${prio_match_1} ${score1} - **${score2}** ${prio_match_2} \n`;
        }
    }

}

export function buildWinnerOfName(match: OwcGame) {

    let code1: string = getCode(match.team1_name == undefined ? "" : match.team1_name)
    let code2: string = getCode(match.team2_name == undefined ? "" : match.team2_name)

    if (code1 === undefined) {
        code1 = "AQ";
        match.team1_name = "TBD";
    }

    if (code2 === undefined) {
        code2 = "AQ";
        match.team2_name = "TBD";
    }

    return `${code1.toLocaleLowerCase()}**or**${code2.toLocaleLowerCase()}`

}

export function buildWinnerOfFlag(match: OwcGame) {

    let code1: string = getCode(match == undefined || match.team1_name == undefined ? "" : match.team1_name)
    let code2: string = getCode(match == undefined || match.team2_name == undefined ? "" : match.team2_name)

    if (code1 === undefined) {
        code1 = "AQ";
        match.team1_name = "TBD";
    }

    if (code2 === undefined) {
        code2 = "AQ";
        match.team2_name = "TBD";
    }

    return `:flag_${code1.toLocaleLowerCase()}: **or** :flag_${code2.toLocaleLowerCase()}:`

}

export function getFirstTo(round: number): number {
    switch (round) {
        case 1:
        case 2:
        case -1:
            return 5;
        case 3:
        case 4:
        case -2:
        case -3:
        case -4:
        case -5:
            return 6;
        case 5:
        case 6:
        case -6:
        case -7:
        case -8:
            return 7;
        default:
            return 0;
    }
}

