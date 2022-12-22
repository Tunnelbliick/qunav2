import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } from "discord.js";
import { owc_year } from "../../../api/owc/owc";
import { owc_rank_icons } from "../../../utility/icons";
import { launchCollector } from "./collector";
import { country_overwrite } from "./country_overwrites";
const { overwrite, getCode } = require('country-list');
const DataImageAttachment = require("dataimageattachment");
const imageToBase64 = require('image-to-base64');

export interface tournament_type {
    [index: number | string]: round_info
}

export interface round_info {
    name: string,
    value: number
}

export const bo8: tournament_type = {
    1: { name: "Quarterfinals", value: 1 },
    2: { name: "Semifinals", value: 2 },
    3: { name: "Finals", value: 3 },
    "0": { name: "3rd place match", value: 3 },
}

export const bo16: tournament_type = {
    1: { name: "Round of 16", value: 1 },
    2: { name: "Quarterfinals", value: 2 },
    3: { name: "Semifinals", value: 3 },
    4: { name: "Finals", value: 4 },
    5: { name: "Grand Finals", value: 5 },
    "0": { name: "3rd place match", value: 4 },
    "-1": { name: "Losers Bracket (QF)", value: 2 },
    "-2": { name: "Losers Bracket (SF1)", value: 3 },
    "-3": { name: "Losers Bracket (SF2)", value: 3 },
    "-4": { name: "Losers Bracket (F1)", value: 4 },
    "-5": { name: "Losers Bracket (F2)", value: 4 },
    "-6": { name: "3rd place match", value: 6 },
}

export const bo32: tournament_type = {
    1: { name: "Round of 32", value: 1 },
    2: { name: "Round of 16", value: 2 },
    3: { name: "Quarterfinals", value: 3 },
    4: { name: "Semifinals", value: 4 },
    5: { name: "Finals", value: 5 },
    6: { name: "Grand Finals", value: 6 },
    "0": { name: "3rd place match", value: 5 },
    "-1": { name: "Losers Bracket (RO16)", value: 2 },
    "-2": { name: "Losers Bracket (QF1)", value: 3 },
    "-3": { name: "Losers Bracket (QF2)", value: 3 },
    "-4": { name: "Losers Bracket (SF1)", value: 4 },
    "-5": { name: "Losers Bracket (SF2)", value: 4 },
    "-6": { name: "Losers Bracket (F1)", value: 5 },
    "-7": { name: "Losers Bracket (F2)", value: 5 },
    "-8": { name: "3rd place match", value: 6 },
}

country_overwrite();

export async function buildOwcEmbed(message: any, interaction: any, owc: owc_year) {

    let id;

    if (interaction != null) {
        id = interaction.id;
    } else {
        id = message.id;
    }

    const year = owc.year;
    const country = owc.country;

    const team_country = country?.team;
    const team_matches = country?.matches;

    const file = await imageToBase64(`assets/owc/${year.owc.mode}${year.owc.keys === undefined ? "" : year.owc.keys}_${year.owc.year}.jpg`);
    const uri = "data:image/jpeg;base64," + file

    let description = `[**Challonge**](${year.owc.full_challonge_url})\n[**Bracket**](${year.owc.full_challonge_url}/module)\n\n`;

    let tournament_type: Object = bo32;

    if (year.owc.size === 16) {
        tournament_type = bo16;
    }

    if (year.owc.size === 8) {
        tournament_type = bo8;
    }

    if (team_country !== undefined && team_country !== null) {

        const code: string = getCode(team_country.name);

        description += `Team :flag_${code.toLocaleLowerCase()}: **${team_country.name}**\nPlace: **#${team_country.place}**\nSeed: **#${team_country.seed}**\n\n**__Matches__**\n`

        let index = 0;

        team_matches.forEach((match: any) => {
            index++;
            if (index === team_matches.length) {
                description += buildmatch(match, team_country.place);
            } else {
                description += buildmatch(match);
            }
        })


        const embed = new MessageEmbed().
            setTitle(`Team ${team_country.name} ${year.owc.name}`)
            .setColor("#4b67ba")
            .setDescription(description)
            .setImage("attachment://owc.jpg")

        let reply;

        if (interaction != null) {
            reply = await interaction.editReply({ embeds: [embed], files: [new DataImageAttachment(uri, "owc.jpg")] });
        } else {
            reply = await message.reply({ embeds: [embed], files: [new DataImageAttachment(uri, "owc.jpg")] })
        }
        return;
    }

    let index = 0;

    for (const team of year.team) {

        index++;

        if (team.place === null) {
            team.name = "To be determined";
            team.place = index;
        }

        let code: string = getCode(team.name.replace(/\s\w$/g, ""));

        const emote: any = owc_rank_icons[team.place];

        if (code == undefined) {
            code = "aq";
        }

        description += `${emote} :flag_${code.toLocaleLowerCase()}: **${team.name}** ${team.name === "To be determined" ? "" : "(#"+team.seed+")"} \n`
    }

    const options: any[] = [];

    for (const [key, value] of Object.entries(tournament_type)) {

        if (+key < 1) {
            continue;
        }

        if(year.owc.current_round != null) {
            if(+key > year.owc.current_round) {
                continue;
            }
        }

        // Fallback for single elimination tournaments prior to 2014
        if (year.owc.tournament_type === "single elimination" && value.name === "Grand Finals") {
            continue;
        }

        const option = {
            label: `${value.name}`,
            value: `${value.value}`
        }

        options.push(option);

    }

    const select: any = new MessageSelectMenu().setCustomId(`select_${id}`)
        .setPlaceholder('Select Round')
        .addOptions(options);

    const row = new MessageActionRow().addComponents(select);

    const embed = new MessageEmbed().
        setTitle(`${year.owc.name}`)
        .setColor("#4b67ba")
        .setDescription(description)
        .setImage("attachment://owc.jpg")

    let reply;

    if (interaction != null) {
        reply = await interaction.editReply({ embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "owc.jpg")] });
    } else {
        reply = await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "owc.jpg")] })
    }

    launchCollector(message, interaction, reply, select.customId, owc);

}

export function buildmatch(match: any, place?: any) {

    const code1: string = getCode(match.team1_name);
    const code2: string = getCode(match.team2_name);

    if (code2 === undefined) {
        console.log(match.team2_name);
    }

    if (code1 === undefined) {
        console.log(match.team1_name);
    }


    let team1 = "";
    let team2 = "";

    if (match.winner_name === match.team1_name) {
        team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
        team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
    } else {

        team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
        team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: \n`;
    }

    return `${team1}${team2}`;
}