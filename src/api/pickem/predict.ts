import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import { launchCollector } from "../../embeds/osu/owc/collector";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import { bo32 } from "../../embeds/osu/owc/owc";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import { interaction_silent_thinking } from "../../embeds/utility/thinking";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemPrediction from "../../models/pickemPrediction";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { current_tournament } from "./pickem";
const { overwrite, getCode } = require('country-list');

country_overwrite();

let match_index: number = -1;
let predictionMap: Map<any, any> = new Map<any, any>();
let registration: any = undefined;

export async function predict(interaction: any) {

    let owc_year: any = await owc.findOne({ url: current_tournament })
    let user: any = await User.findOne({ discordid: await encrypt(interaction.user.id) });

    checkIfUserExists(user, undefined, interaction);

    registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    let select: any[] = [1];

    console.log(owc_year.current_round);

    switch (owc_year.current_round) {
        case 1:
            select = [1];
            break;
        case 2:
            select = [2, "-1"];
            break;
        case 3:
            select = [3, "-2", "-3"];
            break;
        case 4:
            select = [4, "-4", "-5"];
            break;
        case 5:
            select = [5, "-6", "-7"];
            break;
        case 6:
            select = [6, "-8"];
    }

    let matches: any = await owcgame.find({ owc: owc_year.id, state: "open", round: { $in: select } });

    let unlocked: any = matches.filter((match: any) => owc_year.unlocked_round.includes(+match.round)).sort((a: any, b: any) => a.round - b.round);

    let matchids: any[] = unlocked.map((match: any) => match.id);

    let predictions: any = await pickemPrediction.find({ registration: registration?.id, match: { $in: matchids } });

    predictions.forEach((prediction: any) => {
        predictionMap.set(prediction.match.toString(), prediction);
    });

    console.log(predictionMap);

    let winners = "__**Winners Bracket**__\n";
    let losers = "";

    let options: any[] = [];

    let index = 0;
    unlocked.forEach((match: any) => {
        index++;

        let code1: string = getCode(match.team1_name).toLocaleLowerCase();
        let code2: string = getCode(match.team2_name).toLocaleLowerCase();

        if (+match.round > 0) {

            let option = {
                label: `${code1} vs ${code2}`,
                value: `${match.id}`
            }

            options.push(option);

            let prediction = predictionMap.get(match.id);

            console.log(match.id);

            if (prediction != null) {
                winners += `${buildmatch(match, prediction.team1_score, prediction.team2_score)}`;
            } else {
                winners += `${buildmatch(match)}`;
            }

            if (index == 2) {
                winners += "\n";
                index = 0;
            }

        } else {

            if (losers === "") {
                losers = "__**Losers Bracket**__\n";
            }

            let option = {
                label: `${code1} vs ${code2} (LS)`,
                value: `${match.id}`
            }

            options.push(option);

            let prediction = predictionMap.get(match.id);

            if (prediction != null) {
                losers += `${buildmatch(match, prediction.team1_score, prediction.team2_score)}`;
            } else {
                losers += `${buildmatch(match)}`;
            }

            if (index == 2) {
                losers += "\n";
                index = 0;
            }

        }

    })

    let description: any = `${winners}\n\n${losers}`;

    let bo_32: any = bo32;

    let round_name = bo_32[unlocked[0].round].name;

    let next_button = new MessageButton()
        .setCustomId(`next_${interaction.id}`)
        .setEmoji("951821813460115527")
        .setStyle("SECONDARY")

    let overview_button = new MessageButton()
        .setCustomId(`overview_${interaction.id}`)
        .setLabel("Back to Menu")
        .setStyle("SECONDARY")

    let prior_button = new MessageButton()
        .setCustomId(`prior_${interaction.id}`)
        .setEmoji("951821813288140840")
        .setStyle("SECONDARY")

    let select_match = new MessageSelectMenu()
        .setCustomId(`select_${interaction.id}`)
        .setPlaceholder("Select a specific match")
        .setOptions(options);

    let button_row = new MessageActionRow().setComponents([prior_button, overview_button, next_button]);
    let select_row = new MessageActionRow().setComponents(select_match);

    let embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Open Predictions ${round_name}`)
        .setDescription(description);

    await interaction.editReply({ embeds: [embed], components: [button_row, select_row] });

    const filter = (i: any) => {
        return i.customId === prior_button.customId ||
            i.customId === overview_button.customId ||
            i.customId === next_button.customId ||
            i.customId === select_match.customId;
    }

    const collector = interaction.channel.createMessageComponentCollector(filter, 60000);

    collector.on("collect", async (i: any) => {

        await i.deferUpdate();

        let method = i.customId.split("_")[0];

        switch (method) {
            case "next":
                await nextPage(interaction, unlocked, button_row, select_row);
                break;
            case "prior":
                await priorPage(interaction, unlocked, button_row, select_row);
                break;
            case "overview":
                await overview(interaction, unlocked, button_row, select_row);
                break;
            case "score":
                await predictMatch(interaction,unlocked,button_row,i.values[0]);
                break;

        }

    });

}

function buildmatch(match: any, team1_score?: any, team2_score?: any) {

    let code1: string = getCode(match.team1_name);
    let code2: string = getCode(match.team2_name);

    if (code2 === undefined) {
        console.log(match.team2_name);
    }

    if (code1 === undefined) {
        console.log(match.team1_name);
    }

    let team1 = "";
    let team2 = "";

    if(team1_score === undefined || team2_score === undefined) {
    team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} **vs**`;
    team2 = ` ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
    return `${team1}${team2}`;
    }

    if(team1_score > team2_score) {
        team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${team1_score}** - `;
        team2 = `${team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
        return `${team1}${team2}`;
    } else {
        team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${team1_score} - `;
        team2 = `**${team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: \n`;
        return `${team1}${team2}`;
    }

    return `${team1}${team2}`;
}

function getFirstTo(round: any) {
    switch (round) {
        case 1:
        case 2:
        case "-1":
            return 5;
        case 3:
        case 4:
        case "-2":
        case "-3":
        case "-4":
        case "-5":
            return 6;
        case 5:
        case 6:
        case "-6":
        case "-7":
        case "-8":
            return 7;
    }
}

function buildSelect(firstTo: number, prediction?: any) {

    let options: any[] = [];
    let predicted_score = undefined;

    if (prediction != null) {
        predicted_score = prediction.score;
    }

    for (let score2 = firstTo - 1; score2 >= 0; score2--) {

        let option: any = {
            label: `${firstTo} - ${score2}`,
            value: `${firstTo}-${score2}`,
        }

        if (option.value === predicted_score) {
            option.default = true;
        }

        options.push(option);

    }

    for (let score1 = 0; score1 < firstTo; score1++) {

        let option: any = {
            label: `${score1} - ${firstTo}`,
            value: `${score1}-${firstTo}`
        }

        if (option.value === predicted_score) {
            option.default = true;
        }

        options.push(option);

    }

    return options;

}

async function predictMatch(interaction: any, unlocked: any, button_row: any, value: any) {

    if (value == null || value == undefined) {
        return;
    }

    let current_match = unlocked[match_index];

    let prediction = predictionMap.get(current_match.id);

    let score = value.split("-");

    if (score.length != 2) {
        return;
    }

    if (prediction == null) {
        prediction = new pickemPrediction();
        prediction.registration = registration.id;
        prediction.match = current_match.id;
        prediction.score = value;
        prediction.team1_score = score[0];
        prediction.team2_score = score[1];
    } else {
        prediction.score = value;
        prediction.team1_score = score[0];
        prediction.team2_score = score[1];
    }

    await prediction.save();
    predictionMap.set(current_match.id, prediction);

    await buildMatchPreditionEmbed(interaction, unlocked, button_row);
    return;

}

async function buildMatchPreditionEmbed(interaction: any, unlocked: any, button_row: any) {
    let current_match = unlocked[match_index];
    let current_prediction = predictionMap.get(current_match.id);

    let description = ""

    if (current_prediction == null) {
        description = buildmatch(current_match);
    } else {
        description = buildmatch(current_match, current_prediction.team1_score, current_prediction.team2_score);
    }

    let firstTo: any = getFirstTo(current_match.round);
    let select_options: any = buildSelect(firstTo, current_prediction);

    let score_select = new MessageSelectMenu()
        .setCustomId(`score_${interaction.id}`)
        .setPlaceholder("Score prediction of the match")
        .setOptions(select_options);


    let code1: string = getCode(current_match.team1_name).toLocaleLowerCase();
    let code2: string = getCode(current_match.team2_name).toLocaleLowerCase();

    let select_row = new MessageActionRow().setComponents(score_select);

    let embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Prediction ${code1} vs ${code2}`)
        .setDescription(description)
        .setFooter({ text: `Match ${match_index + 1} of ${unlocked.length}` });

    await interaction.editReply({ embeds: [embed], components: [button_row, select_row] });
}

async function nextPage(interaction: any, unlocked: any, button_row: any, select_row: any) {
    if (match_index === -1) {
        match_index = 0;
    } else if (match_index < unlocked.length) {
        match_index++;
    } else {
        match_index = -1;
    }

    if (match_index === -1) {
        await overview(interaction, unlocked, button_row, select_row);
        return;
    }

    await buildMatchPreditionEmbed(interaction, unlocked, button_row);

    return;
}

async function priorPage(interaction: any, unlocked: any, button_row: any, select_row: any) {
    if (match_index === -1) {
        match_index = unlocked.length - 1;
    } else if (match_index > 0) {
        match_index--;
    } else {
        match_index = -1;
    }

    if (match_index === -1) {
        await overview(interaction, unlocked, button_row, select_row);
        return
    }

    await buildMatchPreditionEmbed(interaction, unlocked, button_row);

    return;
}

async function overview(interaction: any, unlocked: any, button_row: any, select_row: any) {

    match_index = -1;

    let winners = "__**Winners Bracket**__\n";
    let losers = "";

    let index = 0;
    unlocked.forEach((match: any) => {
        index++;

        if (+match.round > 0) {

            let prediction = predictionMap.get(match.id);

            if (prediction != null) {
                winners += `${buildmatch(match, prediction.team1_score, prediction.team2_score)}`;
            } else {
                winners += `${buildmatch(match)}`;
            }

            if (index == 2) {
                winners += "\n";
                index = 0;
            }

        } else {

            if (losers === "") {
                losers = "__**Losers Bracket**__\n";
            }

            let prediction = predictionMap.get(match.id);

            if (prediction != null) {
                losers += `${buildmatch(match, prediction.team1_score, prediction.team2_score)}`;
            } else {
                losers += `${buildmatch(match)}`;
            }

            if (index == 2) {
                losers += "\n";
                index = 0;
            }

        }

    })

    let description: any = `${winners}\n\n${losers}`;

    let bo_32: any = bo32;

    let round_name = bo_32[unlocked[0].round].name;

    let embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Open Predictions ${round_name}`)
        .setDescription(description);

    await interaction.editReply({ embeds: [embed], components: [button_row, select_row] });
    return;

}