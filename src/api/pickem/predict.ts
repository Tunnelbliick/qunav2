import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { ObjectId } from "mongoose";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import { bo32, tournament_type } from "../../embeds/osu/owc/owc";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import { Owc } from "../../interfaces/owc";
import { OwcGame } from "../../interfaces/owcgame";
import { PickemPrediction } from "../../interfaces/pickemPredictions";
import { PickemRegistration } from "../../interfaces/pickemRegistration";
import { QunaUser } from "../../interfaces/QunaUser";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemPrediction from "../../models/pickemPrediction";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { current_tournament } from "./pickem";
import { buildInitialPredictions, option, embed_parameters, selectRound, buildmatch, getFirstTo, buildWinnerOfName } from "./utility";
const { getCode } = require('country-list');

country_overwrite();

let locked_round: number[] = [];
let locked_matches: number[] = [];

export async function predict(interaction: any, client?: any) {

    let match_index: number = -1;
    let predictionMap: Map<ObjectId, PickemPrediction> = new Map<ObjectId, PickemPrediction>();

    const owc_year: Owc | null = await owc.findOne({ url: current_tournament })

    if (!owc_year) {
        await noPickEm(undefined, interaction);
        return;
    }

    if (owc_year.locked_round !== undefined) {
        locked_round = owc_year.locked_round;
    }

    if (owc_year.locked_matches !== undefined) {
        locked_matches = owc_year.locked_matches;
    }

    const user: QunaUser | null = await User.findOne({ discordid: await encrypt(interaction.user.id) });

    if (checkIfUserExists(user, undefined, interaction) || !user) {
        return
    }

    const registration: PickemRegistration | null = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    if (registration == null) {
        const embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle("Not registered")
            .setDescription("You are **not registered** for the Quna 2022 Pick'em\nPlease register before you can enter any predictions!")

        await interaction.editReply({ embeds: [embed] });
        return;
    }

    const select: string[] = selectRound(owc_year);

    const matches: OwcGame[] = await owcgame.find({ owc: owc_year.id, round: { $in: select } });
    const all_matches: OwcGame[] = await owcgame.find({ owc: owc_year.id });
    const match_map: Map<number, OwcGame> = new Map<number, OwcGame>();
    const unlocked: OwcGame[] = matches.sort((a: OwcGame, b: OwcGame) => b.round - a.round);
    all_matches.forEach((match: OwcGame) => {
        match_map.set(match.matchid, match);
    })
    const matchids: ObjectId[] = unlocked.map((match: OwcGame) => match.id);
    const predictions: PickemPrediction[] = await pickemPrediction.find({ registration: registration?.id, match: { $in: matchids } });

    predictions.forEach((prediction: PickemPrediction) => {
        predictionMap.set(prediction.match, prediction);
    });

    const embed_parameters: embed_parameters = buildInitialPredictions(unlocked, predictionMap, match_map);

    const bo_32: tournament_type = bo32;

    const round_name = bo_32[unlocked[0].round].name;

    const next_button = new MessageButton()
        .setCustomId(`next_${interaction.id}`)
        .setEmoji("951821813460115527")
        .setStyle("SECONDARY")

    const overview_button = new MessageButton()
        .setCustomId(`overview_${interaction.id}`)
        .setLabel("Back to Menu")
        .setStyle("SECONDARY")

    const prior_button = new MessageButton()
        .setCustomId(`prior_${interaction.id}`)
        .setEmoji("951821813288140840")
        .setStyle("SECONDARY")

    const select_match = new MessageSelectMenu()
        .setCustomId(`select_${interaction.id}`)
        .setPlaceholder("Select a specific match")
        .setOptions(embed_parameters.options);

    const button_row = new MessageActionRow().setComponents([prior_button, overview_button, next_button]);
    const select_row = new MessageActionRow().setComponents(select_match);

    const embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Open Predictions ${round_name}`)
        .setDescription(embed_parameters.description);

    await interaction.editReply({ embeds: [embed], components: [button_row, select_row] });

    const filter = (i: ButtonInteraction | SelectMenuInteraction) => {
        return i.customId === prior_button.customId ||
            i.customId === overview_button.customId ||
            i.customId === next_button.customId ||
            i.customId === select_match.customId ||
            i.customId === `score_${interaction.id}`;
    }

    let channel = null;

    if (interaction.channel === null) {
        channel = await client.channels.cache.get(interaction.message.channel_id);
    } else {
        channel = interaction.channel;
    }

    if (channel === null || channel === undefined) {
        await interaction.editReply("there was an error creating the Embed, please try again or use a Server!");
        return;
    }

    const collector = channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i: ButtonInteraction | SelectMenuInteraction) => {

        const split = i.customId.split("_");
        const interaction_id = split[1];

        if (interaction.id !== interaction_id) {
            return;
        }

        await i.deferUpdate();

        const method = split[0];

        switch (method) {
            case "next":
                match_index = await nextPage(interaction, unlocked, predictionMap, match_index, button_row, select_row, match_map);
                break;
            case "prior":
                match_index = await priorPage(interaction, unlocked, predictionMap, match_index, button_row, select_row, match_map);
                break;
            case "overview":
                match_index = await overview(interaction, unlocked, predictionMap, match_index, button_row, select_row, match_map);
                break;
            case "score":
                if (i instanceof SelectMenuInteraction)
                    predictionMap = await predictMatch(interaction, registration, unlocked, predictionMap, match_index, button_row, i.values[0], match_map);
                break;
            case "select":
                if (i instanceof SelectMenuInteraction)
                    match_index = await selectPage(interaction, unlocked, predictionMap, match_index, button_row, i.values[0], match_map);
                break;
        }

        collector.resetTimer();

    });

    collector.on("end", async () => {

        const embed_parameters: embed_parameters = buildInitialPredictions(unlocked, predictionMap, match_map);

        const bo_32: tournament_type = bo32;

        const round_name = bo_32[unlocked[0].round].name;

        const embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle(`Open Predictions ${round_name}`)
            .setDescription(embed_parameters.description)
            .setAuthor({ name: "Time ran out please open again" });

        await interaction.editReply({ embeds: [embed], components: [] });

    });
}

function buildSelect(firstTo: number, prediction?: PickemPrediction) {

    const options: option[] = [];
    let predicted_score = undefined;

    if (prediction != null) {
        predicted_score = prediction.score;
    }

    for (let score2 = firstTo - 1; score2 >= 0; score2--) {

        const option: option = {
            label: `${firstTo} - ${score2}`,
            value: `${firstTo}-${score2}`,
        }

        if (option.value === predicted_score) {
            option.default = true;
        }

        options.push(option);

    }

    for (let score1 = 0; score1 < firstTo; score1++) {

        const option: option = {
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

async function predictMatch(interaction: ButtonInteraction | SelectMenuInteraction, registration: PickemRegistration | null, unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_index: number, button_row: MessageActionRow, value: string, match_map: Map<number, OwcGame>) {

    if (value == null || value == undefined || registration == null) {
        return predictionMap;
    }

    const current_match = unlocked[match_index];

    let prediction = predictionMap.get(current_match.id);

    const score = value.split("-");

    if (score.length != 2) {
        return predictionMap;
    }

    const winner_index = score[0] > score[1] ? 1 : 2;

    if (prediction == null) {
        prediction = new pickemPrediction();
        prediction.registration = registration.id;
        prediction.match = current_match.id;
        prediction.score = value;
        prediction.team1_score = parseInt(score[0]);
        prediction.team2_score = parseInt(score[1]);
        prediction.winner_index = winner_index;
        prediction.calculated = false;
    } else {
        prediction.score = value;
        prediction.team1_score = parseInt(score[0]);
        prediction.team2_score = parseInt(score[1]);
        prediction.winner_index = winner_index;
    }

    const model = new pickemPrediction();

    model.set(prediction);

    await model.save();

    predictionMap.set(current_match.id, prediction);

    await buildMatchPreditionEmbed(interaction, unlocked, predictionMap, match_index, button_row, match_map);
    return predictionMap;

}

async function buildMatchPreditionEmbed(interaction: ButtonInteraction | SelectMenuInteraction, unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_index: number, button_row: MessageActionRow, match_map: Map<number, OwcGame>) {
    const current_match = unlocked[match_index];
    const current_prediction = predictionMap.get(current_match.id);

    let description = ""

    if (current_prediction == null) {
        description = buildmatch(current_match, undefined, undefined, match_map);
    } else {
        description = buildmatch(current_match, current_prediction.team1_score, current_prediction.team2_score, match_map);
    }

    const firstTo: number = getFirstTo(current_match.round);
    const select_options: option[] = buildSelect(firstTo, current_prediction);

    const score_select = new MessageSelectMenu()
        .setCustomId(`score_${interaction.id}`)
        .setPlaceholder("Score prediction of the match")
        .setOptions(select_options);


    let code1: string = getCode(current_match.team1_name == undefined ? "" : current_match.team1_name)
    let code2: string = getCode(current_match.team2_name == undefined ? "" : current_match.team2_name)

    if (code1 === undefined) {
        code1 = buildWinnerOfName(match_map.get(current_match.data.player1_prereq_match_id)!);
    }

    if (code2 === undefined) {
        code2 = buildWinnerOfName(match_map.get(current_match.data.player2_prereq_match_id)!);
    }

    code1 = code1.toLocaleLowerCase();
    code2 = code2.toLocaleLowerCase();

    const select_row = new MessageActionRow().setComponents(score_select);

    let components = [button_row];

    const embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Prediction ${code1} vs ${code2}`)
        .setDescription(description)
        .setFooter({ text: `Match ${match_index + 1} of ${unlocked.length}` });

    if (locked_round.includes(current_match.round) || locked_matches.includes(current_match.matchid)) {
        embed.setAuthor({ name: "Predictions closed" })
        components = [button_row];
    } else {
        components = [button_row, select_row];
    }


    await interaction.editReply({ embeds: [embed], components: components });
}

async function selectPage(interaction: ButtonInteraction | SelectMenuInteraction, unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_index: number, button_row: MessageActionRow, value: string, match_map: Map<number, OwcGame>) {

    match_index = parseInt(value);

    await buildMatchPreditionEmbed(interaction, unlocked, predictionMap, match_index, button_row, match_map);

    return match_index;
}

async function nextPage(interaction: ButtonInteraction | SelectMenuInteraction, unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_index: number, button_row: MessageActionRow, select_row: MessageActionRow, match_map: Map<number, OwcGame>) {

    if (match_index === -1) {
        match_index = 0;
    } else if (match_index < unlocked.length - 1) {
        match_index++;
    } else {
        match_index = -1;
    }

    if (match_index === -1) {
        await overview(interaction, unlocked, predictionMap, match_index, button_row, select_row, match_map);
        return match_index;
    }

    await buildMatchPreditionEmbed(interaction, unlocked, predictionMap, match_index, button_row, match_map);

    return match_index;
}

async function priorPage(interaction: ButtonInteraction | SelectMenuInteraction, unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_index: number, button_row: MessageActionRow, select_row: MessageActionRow, match_map: Map<number, OwcGame>) {
    if (match_index === -1) {
        match_index = unlocked.length - 1;
    } else if (match_index > 0) {
        match_index--;
    } else {
        match_index = -1;
    }

    if (match_index === -1) {
        await overview(interaction, unlocked, predictionMap, match_index, button_row, select_row, match_map);
        return match_index;
    }

    await buildMatchPreditionEmbed(interaction, unlocked, predictionMap, match_index, button_row, match_map);

    return match_index;
}

async function overview(interaction: ButtonInteraction | SelectMenuInteraction, unlocked: OwcGame[], predictionMap: Map<ObjectId, PickemPrediction>, match_index: number, button_row: MessageActionRow, select_row: MessageActionRow, match_map: Map<number, OwcGame>) {

    match_index = -1;

    let winners = "";
    let losers = "";

    let index = 0;

    unlocked.forEach((match: OwcGame) => {
        index++;

        if (+match.round > 0) {

            if (winners === "") {
                winners = "__**Winners Bracket**__\n";
            }

            const prediction = predictionMap.get(match.id);

            if (prediction != null) {
                winners += `${buildmatch(match, prediction.team1_score, prediction.team2_score, match_map)}`;
            } else {
                winners += `${buildmatch(match, undefined, undefined, match_map)}`;
            }

            if (index == 2) {
                winners += "\n";
                index = 0;
            }

        } else {

            if (losers === "") {
                losers = "__**Losers Bracket**__\n";
            }

            const prediction = predictionMap.get(match.id);

            if (prediction != null) {
                losers += `${buildmatch(match, prediction.team1_score, prediction.team2_score, match_map)}`;
            } else {
                losers += `${buildmatch(match, undefined, undefined, match_map)}`;
            }

            if (index == 2) {
                losers += "\n";
                index = 0;
            }

        }

    })

    const components = [];

    if (button_row !== undefined) {
        components.push(button_row);
    }

    if (select_row !== undefined) {
        components.push(select_row);
    }

    const description: string = `${winners}\n${losers}`;

    const bo_32: tournament_type = bo32;

    const round_name = bo_32[unlocked[0].round].name;

    const embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Open Predictions ${round_name}`)
        .setDescription(description);

    await interaction.editReply({ embeds: [embed], components: components });
    return match_index;

}