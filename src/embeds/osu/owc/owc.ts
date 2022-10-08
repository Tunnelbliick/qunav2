import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } from "discord.js";
import { owc_year } from "../../../api/owc/owc";
import { owc_rank_icons } from "../../../utility/icons";
import { launchCollector } from "./collector";
import { country_overwrite } from "./country_overwrites";
const { overwrite, getCode } = require('country-list');
const DataImageAttachment = require("dataimageattachment");
const imageToBase64 = require('image-to-base64');

export const bo16 = {
    1: { name: "Round of 16", value: 1 },
    2: { name: "Quarterfinals", value: 2 },
    3: { name: "Semifinals", value: 3 },
    4: { name: "Finals", value: 4 },
    5: { name: "Grand Finals", value: 5 },
    "-1": { name: "Losers Bracket (QF)", value: 2 },
    "-2": { name: "Losers Bracket (SF1)", value: 3 },
    "-3": { name: "Losers Bracket (SF2)", value: 3 },
    "-4": { name: "Losers Bracket (F1)", value: 4 },
    "-5": { name: "Losers Bracket (F2)", value: 4 },
    "-6": { name: "3rd place match", value: 6 },
}

export const bo32 = {
    1: { name: "Round of 32", value: 1 },
    2: { name: "Round of 16", value: 2 },
    3: { name: "Quarterfinals", value: 3 },
    4: { name: "Semifinals", value: 4 },
    5: { name: "Finals", value: 5 },
    6: { name: "Grand Finals", value: 6 },
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

    let year = owc.year;
    let country = owc.country;

    let team_country = country?.team;
    let team_matches = country?.matches;

    let description = `[**Challonge**](${year.owc.full_challonge_url})\n[**Bracket**](${year.owc.full_challonge_url}/module)\n\n`;

    for (let team of year.team) {

        let code: string = getCode(team.name);

        let emote: any = owc_rank_icons[team.place];

        description += `${emote} :flag_${code.toLocaleLowerCase()}: **${team.name}** (#${team.seed}) \n`
    }

    let options: any[] = [];
    let tournament_type: Object = bo32;

    if(year.owc.size === 16) {
        tournament_type = bo16;
    }

    for (const [key, value] of Object.entries(tournament_type)) {

        if (+key < 0) {
            continue;
        }

        let option = {
            label: `${value.name}`,
            value: `${value.value}`
        }

        options.push(option);

    }

    let select: any = new MessageSelectMenu().setCustomId(`select_${id}`)
        .setPlaceholder('Select Round')
        .addOptions(options);

    const row = new MessageActionRow().addComponents(select);

    let file = await imageToBase64(`assets/owc/${year.owc.mode}${year.owc.keys === undefined ? "" : year.owc.keys}_${year.owc.year}.jpg`);
    let uri = "data:image/jpeg;base64," + file

    let embed = new MessageEmbed().
        setTitle(`${year.owc.name}`)
        .setColor("#4b67ba")
        .setDescription(description)
        .setImage("attachment://owc.jpg")

    let reply;

    if (interaction != null) {
        reply = await interaction.editReply({embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "owc.jpg")]});
    } else {
        reply = await message.reply({embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "owc.jpg")]})
    }

    launchCollector(message, interaction, reply, select.customId, owc);

}