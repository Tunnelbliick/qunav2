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
import pickemstatistic from "../../models/pickemstatistic";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { getUserByUsername } from "../osu/user";
import { current_tournament } from "./pickem";
import { buildPredictionArguments } from "./predictionsArguments";

const { overwrite, getCode } = require('country-list');
const getCountryISO3 = require("country-iso-2-to-3");

country_overwrite();

export async function predictions(message: any, interaction: any, args: any) {

    const predictionsArgs = await buildPredictionArguments(interaction, args);

    let channel = undefined;
    let osu: any = undefined;
    let discordid = undefined;
    let registration: any = undefined;
    let user: any = undefined;
    let id: any = undefined;

    const owc_year: any = await owc.findOne({ url: current_tournament })

    if (owc_year === null) {
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

    if (checkIfUserExists(user, message, interaction)) {
        return
    }

    registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    if (registration == null) {
        const embed = new MessageEmbed()
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

    const bo_32: any = bo32;
    let round_name = bo_32[owc_year.current_round].name;
    let options: any[] = buildOptions(owc_year, round_name);

    const select: any = new MessageSelectMenu().setCustomId(`select_${id}`)
        .setPlaceholder('Select Round')
        .addOptions(options);

    const row = new MessageActionRow().addComponents(select);

    const filter = (i: any) => {
        return i.customId === select.customId
    }

    const description = await buildEmbed(owc_year, registration, rounds);

    const embed = new MessageEmbed()
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

        const split = i.customId.split("_");

        if (id !== split[1]) {
            return;
        }

        switch (split[0]) {

            case "select":

                rounds = selectRound(+i.values[0]);
                round_name = bo_32[i.values[0]].name;

                options = buildOptions(owc_year, round_name);

                const select: any = new MessageSelectMenu().setCustomId(`select_${id}`)
                    .setPlaceholder('Select Round')
                    .addOptions(options);

                const row = new MessageActionRow().addComponents(select);

                const description = await buildEmbed(owc_year, registration, rounds);

                const embed = new MessageEmbed()
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

        const description = await buildEmbed(owc_year, registration, rounds);

        const embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle(`${user.username} predictions for ${round_name}`)
            .setDescription(description);

        if (interaction)
            await interaction.editReply({ embeds: [embed], components: [] });
        else
            message.edit({ embeds: [embed], components: [] });

    })
}

function buildmatch(match: any, team1_score?: any, team2_score?: any, statistic?: any) {

    let code1: string = getCode(match.team1_name == undefined ? "" : match.team1_name)
    let code2: string = getCode(match.team2_name == undefined ? "" : match.team2_name)

    let statistic_string = "";
    let completed_string = "";
    let points_gained = "";

    if (statistic !== undefined) {

        const total = statistic.team1 + statistic.team2;

        if (total != 0) {
            let team1_perc = 100 / total * statistic.team1;
            let team2_perc = 100 / total * statistic.team2;

            if (team1_perc > team2_perc) {
                statistic_string = ` | **${team1_perc.toFixed(0)}%** - ${team2_perc.toFixed(0)}%`
            } else {
                statistic_string = ` | ${team1_perc.toFixed(0)}% - **${team2_perc.toFixed(0)}%***`
            }
        }
    }

    if (match.state === "complete") {
        if (match.team1_score > match.team2_score) {
            completed_string = ` | **${match.team1_score}** - ${match.team2_score}`
        } else {
            completed_string = ` | ${match.team1_score} - **${match.team2_score}**`
        }

        let points = 0;
        if (match.team1_score > match.team2_score) {
            if (team1_score === match.team1_score) {
                points = points + getPointsForCorrectWinner(match);
            }
        } else {
            if (team2_score === match.team2_score) {
                points = points + getPointsForCorrectWinner(match);
            }
        }
        if (team1_score === match.team1_score && team2_score === match.team2_score) {
            points = points + getPointsForCorrectScore(match);
        }

        points_gained = ` | +**${points}**`
    }

    let country1 = getCountryISO3(code1).toLocaleLowerCase();
    let country2 = getCountryISO3(code2).toLocaleLowerCase();

    if (code1 === undefined) {
        code1 = "AQ";
        match.team1_name = "TBD";
        country1 = "TBD";
    }

    if (code2 === undefined) {
        code2 = "AQ";
        match.team2_name = "TBD";
        country2 = "TBD";
    }

    code1 = code1.toLocaleLowerCase();
    code2 = code2.toLocaleLowerCase();

    let team1 = "";
    let team2 = "";

    if (team1_score === undefined || team2_score === undefined) {
        team1 = `:flag_${code1.toLocaleLowerCase()}: ${country1} **vs**`;
        team2 = ` ${country2} :flag_${code2.toLocaleLowerCase()}:`;
        return `${team1}${team2}${statistic_string}${completed_string}${points_gained}\n`;
    }

    if (team1_score > team2_score) {
        team1 = `:flag_${code1.toLocaleLowerCase()}: **${country1} ${team1_score}** - `;
        team2 = `${team2_score} ${country2} :flag_${code2.toLocaleLowerCase()}:`;
        return `${team1}${team2}${statistic_string}${completed_string}${points_gained}\n`;
    } else {
        team1 = `:flag_${code1.toLocaleLowerCase()}: ${country1} ${team1_score} - `;
        team2 = `**${team2_score} ${country2}** :flag_${code2.toLocaleLowerCase()}:`;
        return `${team1}${team2}${statistic_string}${completed_string}${points_gained}\n`;
    }
}

async function buildEmbed(owc: any, registration: any, rounds: any) {

    const predictionMap: Map<any, any> = new Map<any, any>();
    const statisticMap: Map<any, any> = new Map<any, any>();
    const matches: any = await owcgame.find({ owc: owc.id, round: { $in: rounds } });
    const unlocked: any = matches.sort((a: any, b: any) => b.round - a.round);
    const matchids: any[] = unlocked.map((match: any) => match.id);
    const predictions: any = await pickemPrediction.find({ registration: registration?.id, match: { $in: matchids } });
    const statistic: any = await pickemstatistic.find({ match: { $in: matchids } });

    predictions.forEach((prediction: any) => {
        predictionMap.set(prediction.match.toString(), prediction);
    });

    statistic.forEach((statistic: any) => {
        statisticMap.set(statistic.match.toString(), statistic);
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

            const prediction = predictionMap.get(match.id);

            if (prediction != null) {
                index++;

                let statistic = undefined;

                if (owc.locked_round.includes(match.round)) {
                    statistic = statisticMap.get(match.id.toString());
                }


                if (winners === "") {
                    winners = "__**Winners Bracket**__\n";
                }
                winners += `${buildmatch(match, prediction.team1_score, prediction.team2_score, statistic)}`;

                if (index == 2) {
                    winners += "\n";
                    index = 0;
                }
            }

        } else {

            const prediction = predictionMap.get(match.id);

            if (prediction != null) {
                index++;

                if (losers === "") {
                    losers = "__**Losers Bracket**__\n";
                }

                let statistic = undefined;

                if (owc.locked_round.includes(match.round)) {
                    statistic = statisticMap.get(match.id.toString());
                }


                losers += `${buildmatch(match, prediction.team1_score, prediction.team2_score, statistic)}`;

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

    const options: any[] = [];

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
            const option = {
                label: `${value.name}`,
                value: `${value.value}`,
                default: true
            }
            options.push(option);
        } else {
            const option = {
                label: `${value.name}`,
                value: `${value.value}`
            }
            options.push(option);
        }
    }

    return options;
}

function getPointsForCorrectWinner(match: any) {
    let points = 0;

    switch (match.round) {
        case 1:
        case 2:
        case "-1":
            points = 1;
            break;
        case 3:
        case 4:
        case "-2":
        case "-3":
        case "-4":
        case "-5":
            points = 2;
            break
        default:
            points = 4;
            break;
    }

    return points;
}

function getPointsForCorrectScore(match: any) {
    let points = 0;

    switch (match.round) {
        case 1:
        case 2:
        case "-1":
            points = 3;
            break;
        case 3:
        case 4:
        case "-2":
        case "-3":
        case "-4":
        case "-5":
            points = 5;
            break
        default:
            points = 8;
            break;
    }

    return points;
}