import { MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { ObjectId } from "mongoose";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import { bo32, tournament_type } from "../../embeds/osu/owc/owc";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import { message_thinking } from "../../embeds/utility/thinking";
import { OsuUser } from "../../interfaces/OsuUser";
import { Owc } from "../../interfaces/owc";
import { OwcGame } from "../../interfaces/owcgame";
import { PickemPrediction } from "../../interfaces/pickemPredictions";
import { PickemRegistration } from "../../interfaces/pickemRegistration";
import { PickemStatistics } from "../../interfaces/pickemStatistics";
import { QunaUser } from "../../interfaces/QunaUser";
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
import { option, selectRound, selectRoundByIndex } from "./utility";

const { getCode } = require('country-list');
const getCountryISO3 = require("country-iso-2-to-3");

country_overwrite();

export async function predictions(message: any, interaction: any, args: any) {

    const predictionsArgs = await buildPredictionArguments(interaction, args);

    let channel = undefined;
    let osu: OsuUser | undefined = undefined;
    let discordid = undefined;
    let user: QunaUser | null = null;
    let id: any = undefined;

    const owc_year: Owc | null = await owc.findOne({ url: current_tournament })

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

    if (checkIfUserExists(user, message, interaction) || !user) {
        return
    }

    const registration: PickemRegistration | null = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

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

    let rounds: string[] = ["1"];
    rounds = selectRound(owc_year);

    const bo_32: tournament_type = bo32;
    let round_name = bo_32[owc_year.current_round].name;
    let options: option[] = buildOptions(owc_year, round_name);

    const select = new MessageSelectMenu().setCustomId(`select_${id}`)
        .setPlaceholder('Select Round')
        .addOptions(options);

    const row = new MessageActionRow().addComponents(select);

    const filter = (i: SelectMenuInteraction) => {
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

    collector.on("collect", async (i: SelectMenuInteraction) => {

        i.deferUpdate();

        const split = i.customId.split("_");

        if (id !== split[1]) {
            return;
        }

        switch (split[0]) {

            case "select":

                if (checkIfUserExists(user, message, interaction) || !user) {
                    return
                }

                rounds = selectRoundByIndex(+i.values[0]);
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

        if (checkIfUserExists(user, message, interaction) || !user) {
            return
        }

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

async function buildEmbed(owc: Owc, registration: PickemRegistration, rounds: string[]) {

    const predictionMap: Map<ObjectId, PickemPrediction> = new Map<ObjectId, PickemPrediction>();
    const statisticMap: Map<ObjectId, PickemStatistics> = new Map<ObjectId, PickemStatistics>();
    const matches: OwcGame[] = await owcgame.find({ owc: owc.id, round: { $in: rounds } });
    const unlocked: OwcGame[] = matches.sort((a: OwcGame, b: OwcGame) => b.round - a.round);
    const matchids: ObjectId[] = unlocked.map((match: OwcGame) => match.id);
    const predictions: PickemPrediction[] = await pickemPrediction.find({ registration: registration?.id, match: { $in: matchids } });
    const statistic: PickemStatistics[] = await pickemstatistic.find({ match: { $in: matchids } });

    predictions.forEach((prediction: PickemPrediction) => {
        predictionMap.set(prediction.match, prediction);
    });

    statistic.forEach((statistic: PickemStatistics) => {
        statisticMap.set(statistic.match, statistic);
    });

    let winners = "";
    let losers = "";
    let index = 0;

    unlocked.forEach((match: OwcGame) => {

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
                    statistic = statisticMap.get(match.id);
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
                    statistic = statisticMap.get(match.id);
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

function buildmatch(match: OwcGame, team1_score?: number, team2_score?: number, statistic?: PickemStatistics) {

    let code1: string = getCode(match.team1_name == undefined ? "" : match.team1_name)
    let code2: string = getCode(match.team2_name == undefined ? "" : match.team2_name)

    let statistic_string = "";
    let completed_string = "";
    let points_gained = "";

    if (statistic !== undefined) {

        statistic_string = buildMatchWithPredictions(statistic, statistic_string);
    }

    if (match.state === "complete") {

        ({ completed_string, points_gained } = buildCompletedMatch(match, completed_string, team1_score, team2_score, points_gained));
    }

    let country1 = getCountryISO3(code1)
    let country2 = getCountryISO3(code2)

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

    country1 = country1.charAt(0) + country1.substring(1).toLowerCase();
    country2 = country2.charAt(0) + country2.substring(1).toLowerCase();

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

function buildCompletedMatch(match: OwcGame, completed_string: string, team1_score: number | undefined, team2_score: number | undefined, points_gained: string) {
    if (match.team1_score > match.team2_score) {
        completed_string = ` | **${match.team1_score}** - ${match.team2_score}`;
    } else {
        completed_string = ` | ${match.team1_score} - **${match.team2_score}**`;
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

    points_gained = ` | +**${points}**`;
    return { completed_string, points_gained };
}

function buildMatchWithPredictions(statistic: PickemStatistics, statistic_string: string) {
    const total = statistic.team1 + statistic.team2;

    if (total != 0) {
        const team1_perc = 100 / total * statistic.team1;
        const team2_perc = 100 / total * statistic.team2;

        if (team1_perc > team2_perc) {
            statistic_string = ` | **${team1_perc.toFixed(0)}%** - ${team2_perc.toFixed(0)}%`;
        } else {
            statistic_string = ` | ${team1_perc.toFixed(0)}% - **${team2_perc.toFixed(0)}%**`;
        }
    }
    return statistic_string;
}

function buildOptions(owc: Owc, roundname: string) {

    const options: option[] = [];

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

export function getPointsForCorrectWinner(match: OwcGame): number {
    let points = 0;

    if ([292728120, 292728123].includes(match.matchid)) {
        return 0;
    }

    switch (match.round) {
        case 1:
        case 2:
        case -1:
        case -2:
            points = 1;
            break;
        case 3:
        case 4:
        case -3:
        case -4:
        case -5:
        case -6:
            points = 2;
            break
        default:
            points = 2;
            break;
    }

    return points;
}

export function getPointsForCorrectScore(match: OwcGame): number {
    let points = 0;

    if ([292728120, 292728123].includes(match.matchid)) {
        return 0;
    }

    switch (match.round) {
        case 1:
        case 2:
        case -1:
        case -2:
            points = 3;
            break;
        case 3:
        case 4:
        case -3:
        case -4:
        case -5:
            points = 4;
            break
        default:
            points = 6;
            break;
    }

    return points;
}