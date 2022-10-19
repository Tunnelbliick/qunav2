import { MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import { bo32 } from "../../embeds/osu/owc/owc";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import { message_thinking } from "../../embeds/utility/thinking";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemPrediction from "../../models/pickemPrediction";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { getUserByUsername } from "../osu/user";
import { current_tournament } from "./pickem";
import { buildPredictionArguments } from "./predictionsArguments";

const { overwrite, getCode } = require('country-list');

country_overwrite();

export async function predictions(message: any, interaction: any, args: any) {

    let predictionsArgs = await buildPredictionArguments(interaction, args);

    let channel = undefined;
    let osu: any = undefined;
    let discordid = undefined;
    let registration: any = undefined;
    let user: any = undefined;
    let id: any = undefined;

    let owc_year: any = await owc.findOne({ url: current_tournament })

    if(owc_year === null) {
        await noPickEm(message, interaction);
        return;
    }

    if (interaction) {
        channel = interaction.channel;
        discordid = interaction.user.id;
        id = interaction.id;
    } else {
        id = message.id;
        channel = message.channel;
        discordid = message.author.id;
        message_thinking(message);
    }

    if (predictionsArgs.discordid !== undefined) {
        discordid = predictionsArgs.discordid;
    }

    if (predictionsArgs.username !== undefined) {
        osu = await getUserByUsername(predictionsArgs.username);
    }

    if (osu !== undefined) {
        user = await User.findOne({ userid: osu.id });
    } else {
        user = await User.findOne({ discordid: await encrypt(discordid) });
    }

    if(checkIfUserExists(user, message, interaction)) {
        return
    }
    
    registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    if (registration == null) {
        let embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle("Not registered")
            .setDescription("You are **not registered** for the Quna 2022 Pick'em\nPlease register before you can enter any predictions!")

        if (interaction)
            await interaction.editReply({ embeds: [embed] });
        else
            await message.reply({ embeds: [embed] });
        return;
    }

    let rounds: any[] = [1];
    rounds = selectRound(owc_year.current_round);

    let bo_32: any = bo32;
    let round_name = bo_32[owc_year.current_round].name;
    let options: any[] = buildOptions(owc_year, round_name);

    let select: any = new MessageSelectMenu().setCustomId(`select_${id}`)
        .setPlaceholder('Select Round')
        .addOptions(options);

    const row = new MessageActionRow().addComponents(select);

    const filter = (i: any) => {
        return i.customId === select.customId
    }

    let description = await buildEmbed(owc_year, registration, rounds);

    let embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`${user.username} predictions for ${round_name}`)
        .setDescription(description);

    if (interaction)
        await interaction.editReply({ embeds: [embed], components: [row] });
    else
        message = await message.reply({ embeds: [embed], components: [row] });

    const collector = channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i: any) => {

        i.deferUpdate();

        let split = i.customId.split("_");

        if (id !== split[1]) {
            return;
        }

        switch (split[0]) {

            case "select":

                rounds = selectRound(+i.values[0]);
                round_name = bo_32[i.values[0]].name;

                options = buildOptions(owc_year, round_name);

                let select: any = new MessageSelectMenu().setCustomId(`select_${id}`)
                    .setPlaceholder('Select Round')
                    .addOptions(options);

                const row = new MessageActionRow().addComponents(select);

                let description = await buildEmbed(owc_year, registration, rounds);

                let embed = new MessageEmbed()
                    .setColor("#4b67ba")
                    .setTitle(`${user.username} predictions for ${round_name}`)
                    .setDescription(description);

                if (interaction)
                    await interaction.editReply({ embeds: [embed], components: [row] });
                else
                    message.edit({ embeds: [embed], components: [row] });

                break;

        }

        collector.resetTimer();

    });

    collector.on("end", async () => {

        round_name = bo_32[owc_year.current_round].name;

        let description = await buildEmbed(owc_year, registration, rounds);

        let embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle(`${user.username} predictions for ${round_name}`)
            .setDescription(description);

        if (interaction)
            await interaction.editReply({ embeds: [embed], components: [] });
        else
            message.edit({ embeds: [embed], components: [] });

    })
}

function buildmatch(match: any, team1_score?: any, team2_score?: any) {

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

async function buildEmbed(owc: any, registration: any, rounds: any) {

    let predictionMap: Map<any, any> = new Map<any, any>();
    let matches: any = await owcgame.find({ owc: owc.id, round: { $in: rounds } });
    let unlocked: any = matches.sort((a: any, b: any) => b.round - a.round);
    let matchids: any[] = unlocked.map((match: any) => match.id);
    let predictions: any = await pickemPrediction.find({ registration: registration?.id, match: { $in: matchids } });

    predictions.forEach((prediction: any) => {
        predictionMap.set(prediction.match.toString(), prediction);
    });

    let winners = "";
    let losers = "";
    let index = 0;

    unlocked.forEach((match: any) => {

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

            let prediction = predictionMap.get(match.id);

            if (prediction != null) {
                index++;

                if (winners === "") {
                    winners = "__**Winners Bracket**__\n";
                }
                winners += `${buildmatch(match, prediction.team1_score, prediction.team2_score)}`;

                if (index == 2) {
                    winners += "\n";
                    index = 0;
                }
            }

        } else {

            let prediction = predictionMap.get(match.id);

            if (prediction != null) {
                index++;

                if (losers === "") {
                    losers = "__**Losers Bracket**__\n";
                }
                losers += `${buildmatch(match, prediction.team1_score, prediction.team2_score)}`;

                if (index == 2) {
                    losers += "\n";
                    index = 0;
                }
            }
        }

    })

    if (winners === "") {
        winners = "No predictions.";
    }

    return `${winners}\n${losers}`;
}

function selectRound(round: any) {

    let rounds: any[] = [1];

    switch (round) {
        case 1:
            rounds = [1];
            break;
        case 2:
            rounds = [2, "-1"];
            break;
        case 3:
            rounds = [3, "-2", "-3"];
            break;
        case 4:
            rounds = [4, "-4", "-5"];
            break;
        case 5:
            rounds = [5, "-6", "-7"];
            break;
        case 6:
            rounds = [6, "-8"];
    }

    return rounds;

}

function buildOptions(owc: any, roundname: any) {

    let options: any[] = [];

    for (const [key, value] of Object.entries(bo32)) {

        if (+key < 1) {
            continue;
        }

        if (owc.current_round != null) {
            if (+key > owc.current_round) {
                continue;
            }
        }

        if (roundname === value.name) {
            let option = {
                label: `${value.name}`,
                value: `${value.value}`,
                default: true
            }
            options.push(option);
        } else {
            let option = {
                label: `${value.name}`,
                value: `${value.value}`
            }
            options.push(option);
        }
    }

    return options;
}