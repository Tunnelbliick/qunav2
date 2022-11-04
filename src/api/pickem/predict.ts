import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import { launchCollector } from "../../embeds/osu/owc/collector";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import { bo32 } from "../../embeds/osu/owc/owc";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
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

let locked_round: any[] = [];
let locked_matches: any[] = [];

export async function predict(interaction: any, client?: any) {

    let match_index: number = -1;
    let predictionMap: Map<any, any> = new Map<any, any>();
    let registration: any = undefined;

    const owc_year: any = await owc.findOne({ url: current_tournament })

    if (owc_year === null) {
        await noPickEm(undefined, interaction);
        return;
    }

    if (owc_year.locked_round !== undefined) {
        locked_round = owc_year.locked_round;
    }

    if (owc_year.locked_matches !== undefined) {
        locked_matches = owc_year.locked_matches;
    }

    const user: any = await User.findOne({ discordid: await encrypt(interaction.user.id) });

    if (checkIfUserExists(user, undefined, interaction)) {
        return
    }

    registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    if (registration == null) {
        const embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle("Not registered")
            .setDescription("You are **not registered** for the Quna 2022 Pick'em\nPlease register before you can enter any predictions!")

        await interaction.editReply({ embeds: [embed] });
        return;
    }

    let select: any[] = [1];

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

    const matches: any = await owcgame.find({ owc: owc_year.id, round: { $in: select } });
    const match_map: Map<number, any> = new Map<number, any>();
    const unlocked: any = matches.sort((a: any, b: any) => b.round - a.round);
    matches.forEach((match: any) => {
        match_map.set(match.matchid, match);
    })
    const matchids: any[] = unlocked.map((match: any) => match.id);
    const predictions: any = await pickemPrediction.find({ registration: registration?.id, match: { $in: matchids } });

    predictions.forEach((prediction: any) => {
        predictionMap.set(prediction.match.toString(), prediction);
    });

    let winners = "";
    let losers = "";

    const options: any[] = [];

    let split_index = 0;
    let index = 0;
    unlocked.forEach((match: any) => {
        split_index++;

        let code1: string = getCode(match.team1_name === undefined ? "" : match.team1_name)
        let code2: string = getCode(match.team2_name === undefined ? "" : match.team2_name)

        if (code1 === undefined) {
            code1 = "TBD";
        }

        if (code2 === undefined) {
            code2 = "TBD";
        }

        code1 = code1.toLocaleLowerCase();
        code2 = code2.toLocaleLowerCase();

        if (+match.round > 0) {

            if (winners === "") {
                winners = "__**Winners Bracket**__\n";
            }

            const option = {
                label: `${code1} vs ${code2}`,
                value: `${index}`
            }

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

        } else {

            if (losers === "") {
                losers = "__**Losers Bracket**__\n";
            }

            const option = {
                label: `${code1} vs ${code2} (LS)`,
                value: `${index}`
            }

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

        }

        index++;

    })


    const description: any = `${winners}\n${losers}`;

    const bo_32: any = bo32;

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
        .setOptions(options);

    const button_row = new MessageActionRow().setComponents([prior_button, overview_button, next_button]);
    const select_row = new MessageActionRow().setComponents(select_match);

    const embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Open Predictions ${round_name}`)
        .setDescription(description);

    await interaction.editReply({ embeds: [embed], components: [button_row, select_row] });

    const filter = (i: any) => {
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

    collector.on("collect", async (i: any) => {

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
                predictionMap = await predictMatch(interaction, registration, unlocked, predictionMap, match_index, button_row, i.values[0], match_map);
                break;
            case "select":
                match_index = await selectPage(interaction, unlocked, predictionMap, match_index, button_row, i.values[0], match_map);
                break;
        }

        collector.resetTimer();

    });

    collector.on("end", async () => {

        let winners = "";
        let losers = "";

        let index = 0;
        unlocked.forEach((match: any) => {
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

        const description: any = `${winners}\n${losers}`;

        const bo_32: any = bo32;

        const round_name = bo_32[unlocked[0].round].name;

        const embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle(`Open Predictions ${round_name}`)
            .setDescription(description)
            .setAuthor({ name: "Time ran out please open again" });

        await interaction.editReply({ embeds: [embed], components: [] });

    });

}

function buildmatch(match: any, team1_score?: any, team2_score?: any, match_map?: Map<number, any>) {

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

function buildWinnerOf(match: any, match_map: Map<number, any>, score1: number, score2: number) {

    let prio_match_1 = match.team1_name;
    let prio_match_2 = match.team2_name;

    if (prio_match_1 === undefined) {
        prio_match_1 = buildWinnerOfFlag(match_map.get(match.data.player1_prereq_match_id));
    } else {
        const code1: string = getCode(match.team1_name == undefined ? "" : match.team1_name)
        prio_match_1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name}**`;
    }

    if (prio_match_2 === undefined) {
        prio_match_2 = buildWinnerOfFlag(match_map.get(match.data.player2_prereq_match_id));
    } else {
        const code1: string = getCode(match.team2_name == undefined ? "" : match.team2_name)
        prio_match_1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team2_name}**`;
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

function buildWinnerOfName(match: any) {

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

function buildWinnerOfFlag(match: any) {

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

    return `:flag_${code1.toLocaleLowerCase()}: **or** :flag_${code2.toLocaleLowerCase()}:`

}

function getFirstTo(round: any) {
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
    }
}

function buildSelect(firstTo: number, prediction?: any) {

    const options: any[] = [];
    let predicted_score = undefined;

    if (prediction != null) {
        predicted_score = prediction.score;
    }

    for (let score2 = firstTo - 1; score2 >= 0; score2--) {

        const option: any = {
            label: `${firstTo} - ${score2}`,
            value: `${firstTo}-${score2}`,
        }

        if (option.value === predicted_score) {
            option.default = true;
        }

        options.push(option);

    }

    for (let score1 = 0; score1 < firstTo; score1++) {

        const option: any = {
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

async function predictMatch(interaction: any, registration: any, unlocked: any, predictionMap: any, match_index: any, button_row: any, value: any, match_map: any) {

    if (value == null || value == undefined) {
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
        prediction.team1_score = score[0];
        prediction.team2_score = score[1];
        prediction.winner_index = winner_index;
        prediction.calculated = false;
    } else {
        prediction.score = value;
        prediction.team1_score = score[0];
        prediction.team2_score = score[1];
        prediction.winner_index = winner_index;
    }

    await prediction.save();

    predictionMap.set(current_match.id, prediction);

    await buildMatchPreditionEmbed(interaction, unlocked, predictionMap, match_index, button_row, match_map);
    return predictionMap;

}

async function buildMatchPreditionEmbed(interaction: any, unlocked: any, predictionMap: any, match_index: any, button_row: any, match_map: any) {
    const current_match = unlocked[match_index];
    const current_prediction = predictionMap.get(current_match.id);

    let description = ""

    if (current_prediction == null) {
        description = buildmatch(current_match, undefined, undefined, match_map);
    } else {
        description = buildmatch(current_match, current_prediction.team1_score, current_prediction.team2_score, match_map);
    }

    const firstTo: any = getFirstTo(current_match.round);
    const select_options: any = buildSelect(firstTo, current_prediction);

    const score_select = new MessageSelectMenu()
        .setCustomId(`score_${interaction.id}`)
        .setPlaceholder("Score prediction of the match")
        .setOptions(select_options);


    let code1: string = getCode(current_match.team1_name == undefined ? "" : current_match.team1_name)
    let code2: string = getCode(current_match.team2_name == undefined ? "" : current_match.team2_name)

    if (code1 === undefined) {
        code1 = buildWinnerOfName(match_map.get(current_match.data.player1_prereq_match_id));
    }

    if (code2 === undefined) {
        code2 = buildWinnerOfName(match_map.get(current_match.data.player2_prereq_match_id));
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

async function selectPage(interaction: any, unlocked: any, predictionMap: any, match_index: any, button_row: any, value: any, match_map: any) {

    match_index = value;

    await buildMatchPreditionEmbed(interaction, unlocked, predictionMap, match_index, button_row, match_map);

    return match_index;
}

async function nextPage(interaction: any, unlocked: any, predictionMap: any, match_index: any, button_row: any, select_row: any, match_map: any) {

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

async function priorPage(interaction: any, unlocked: any, predictionMap: any, match_index: any, button_row: any, select_row: any, match_map: any) {
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

async function overview(interaction: any, unlocked: any, predictionMap: any, match_index: any, button_row?: any, select_row?: any, match_map?: any) {

    match_index = -1;

    let winners = "";
    let losers = "";

    let index = 0;
    unlocked.forEach((match: any) => {
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

    const description: any = `${winners}\n${losers}`;

    const bo_32: any = bo32;

    const round_name = bo_32[unlocked[0].round].name;

    const embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Open Predictions ${round_name}`)
        .setDescription(description);

    await interaction.editReply({ embeds: [embed], components: components });
    return match_index;

}