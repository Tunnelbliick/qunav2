import { MessageEmbed } from "discord.js";
import { desc } from "osu-api-extended/dist/utility/mods";
import { owc_year } from "../../../api/owc/owc";
import { owc_rank_icons } from "../../../utility/icons";
import { country_overwrite } from "./country_overwrites";
import { bo16, bo32, bo8 } from "./owc";
const { overwrite, getCode } = require('country-list');

country_overwrite();

export async function launchCollector(message: any, interaction: any, reply: any, customid: any, owc: owc_year) {

    let channel;

    if (interaction) {
        channel = interaction.channel;
    } else {
        channel = message.channel;
    }


    const filter = (i: any) => {
        return i.customId === customid
    }

    const year = owc.year;
    const rounds: Array<any[]> = [];

    owc.year.matches.forEach((item: any) => {

        const r = item.round;

        if (rounds[r] === undefined) {
            rounds[r] = [];
        }

        rounds[r].push(item);

    })

    const collector = channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i: any) => {

        let tournament_type: any = bo32;

        if (year.owc.size === 16) {
            tournament_type = bo16;
        }

        if (year.owc.size === 8) {
            tournament_type = bo8;
        }

        const round_name = tournament_type[+i.values[0]].name;

        await i.deferUpdate({ content: `${round_name}` });

        let description = `[**Challonge**](${year.owc.full_challonge_url})\n[**Bracket**](${year.owc.full_challonge_url}/module)\n\n`;

        let info: row

        if (year.owc.tournament_type === "single elimination") {

            switch (year.owc.size) {
                case 32:
                    switch (+i.values[0]) {
                        case 1:
                            info = { bo: bo32, winner: 1 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 2:
                            info = { bo: bo32, winner: 2 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 3:
                            info = { bo: bo32, winner: 3 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 4:
                            info = { bo: bo32, winner: 4 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 5:
                            info = { bo: bo32, winner: 5, loser: "0" };
                            description += buildRow(rounds, info, 1, true);
                            break;
                    }
                    break;
                case 16:
                    switch (+i.values[0]) {
                        case 1:
                            info = { bo: bo16, winner: 1 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 2:
                            info = { bo: bo16, winner: 2 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 3:
                            info = { bo: bo16, winner: 3 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 4:
                            info = { bo: bo16, winner: 4, loser: "0" };
                            description += buildRow(rounds, info, 1, true);
                            break;
                    }
                    break;
                case 8:
                    switch (+i.values[0]) {
                        case 1:
                            info = { bo: bo8, winner: 1 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 2:
                            info = { bo: bo8, winner: 2 };
                            description += buildRow(rounds, info, undefined, true);
                            break;
                        case 3:
                            info = { bo: bo8, winner: 3, loser: "0" };
                            description += buildRow(rounds, info, 1, true);
                            break;
                    }
                    break;
            }

        } else {

            if (year.owc.size === 32) {
                switch (+i.values[0]) {
                    case 1:
                        info = { bo: bo32, winner: 1 };
                        description += buildRow(rounds, info);
                        break;
                    case 2:
                        info = { bo: bo32, winner: 2, loser: "-1" };
                        description += buildRow(rounds, info);
                        break;
                    case 3:
                        info = { bo: bo32, winner: 3, loser: "-2", loser2: "-3" };
                        description += buildRow(rounds, info);
                        break;
                    case 4:
                        info = { bo: bo32, winner: 4, loser: "-4", loser2: "-5" };
                        description += buildRow(rounds, info);
                        break;
                    case 5:
                        info = { bo: bo32, winner: 5, loser: "-6", loser2: "-7" };
                        description += buildRow(rounds, info, 5);
                        break;
                    case 6:
                        info = { bo: bo32, winner: 6, loser: "-8" };
                        description += buildRow(rounds, info, 1);
                        break;
                }
            } else {
                switch (+i.values[0]) {
                    case 1:
                        info = { bo: bo16, winner: 1 };
                        description += buildRow(rounds, info);
                        break;
                    case 2:
                        info = { bo: bo16, winner: 2, loser: "-1" };
                        description += buildRow(rounds, info);
                        break;
                    case 3:
                        info = { bo: bo16, winner: 3, loser: "-2", loser2: "-3" };
                        description += buildRow(rounds, info);
                        break;
                    case 4:
                        info = { bo: bo16, winner: 4, loser: "-4", loser2: "-5" };
                        description += buildRow(rounds, info, 5);
                        break;
                    case 5:
                        info = { bo: bo16, winner: 5, loser: "-6" };
                        description += buildRow(rounds, info, 1);
                        break;
                }
            }
        }

        const embed = new MessageEmbed().
            setTitle(`${year.owc.name}`)
            .setColor("#4b67ba")
            .setDescription(description)
            .setImage("attachment://owc.jpg")
            .setFooter({ text: `${round_name}` })

        if (interaction !== undefined) {
            await interaction.editReply({ embeds: [embed] });
        } else {
            await reply.edit({ embeds: [embed] });
        }
    })

    collector.on("end", async () => {

        let description = `[**Challonge**](${year.owc.full_challonge_url})\n[**Bracket**](${year.owc.full_challonge_url}/module)\n\n`;

        for (const team of year.team) {

            let code: string = getCode(team.name);

            if (code === undefined) {
                code = "aq"
            }

            const emote: any = owc_rank_icons[team.place];

            description += `${emote} :flag_${code.toLocaleLowerCase()}: **${team.name}** (#${team.seed}) \n`
        }

        const embed = new MessageEmbed().
            setTitle(`${year.owc.name}`)
            .setColor("#4b67ba")
            .setDescription(description)
            .setImage("attachment://owc.jpg")

        if (interaction !== undefined) {
            await interaction.editReply({ embeds: [embed], components: [] });
        } else {
            await reply.edit({ embeds: [embed], components: [] });
        }

    });

}

interface row {
    bo: any;
    winner: number;
    loser?: string;
    loser2?: string;
}

export function buildRow(rounds: any, info: row, podium?: 1 | 5, single?: boolean) {

    let losers = [];
    let losers2 = [];
    let description = "";

    const matches = rounds[info.winner];
    if (info.loser != null)
        losers = rounds[info.loser];
    if (info.loser2 != null)
        losers2 = rounds[info.loser2];

    if (info.winner > 1 && single !== true) {
        description += "__**Winners Bracket**__\n";
    }

    let local_podium: any;
    if (podium === 1) {
        local_podium = 1;
    }
    description += buildround(matches, local_podium);

    if (info.loser != null) {

        if (podium === 1) {
            local_podium = 3;
        }

        description += `__**${info.bo[info.loser].name}**__\n`;
        description += buildround(losers, local_podium, single);
    }

    if (info.loser2 != null) {

        if (podium === 5) {
            local_podium = 5;
        }

        description += `__**${info.bo[info.loser2].name}**__\n`;
        description += buildround(losers2, local_podium);
    }

    return description;

}

export function buildround(matches: any, podium?: 1 | 3 | 5, single?: boolean) {

    let description = "";

    let index = 0;

    if (matches === undefined) {
        return description;
    }

    matches.forEach((match: any) => {

        if (podium === 5 && matches.length !== index + 1) {
            podium = undefined;
        }
        description += buildmatch(match, podium, single);
        if (matches.length === 1 || index % 2) { description += "\n"; }
        index++;
    });

    return description
}

export function buildmatch(match: any, podium?: 1 | 3 | 5, single?: boolean) {


    let code1: string = getCode(match.team1_name.replace(/\s\w$/g, ""));
    let code2: string = getCode(match.team2_name.replace(/\s\w$/g, ""));

    if (match.team1_name.includes("#")) {
        match.team1_name = "No Enemy";
        code1 = "aq";
    }

    if (match.team2_name.includes("#")) {
        match.team2_name = "No Enemy";
        code2 = "aq";
    }

    if (code1 === undefined) {
        code1 = "aq";
    }

    if (code2 === undefined) {
        code2 = "aq";
    }

    if (code2 === undefined) {
        console.log(match.team2_name);
    }

    if (code1 === undefined) {
        console.log(match.team1_name);
    }

    let team1 = "";
    let team2 = "";

    if (match.state === "open") {
        team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} **vs**`;
        team2 = ` ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;

        return `${team1}${team2}`;
    }

    if (match.winner_name === match.team1_name) {

        if (single) {
            switch (podium) {
                default:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
                    break;
                case 1:
                    team1 = `${owc_rank_icons[1]} :flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[2]}\n`;
                    break;
                case 3:
                    team1 = `${owc_rank_icons[3]} :flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}:\n`;
                    break;
            }
        } else {
            switch (podium) {
                default:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: \n`;
                    break;
                case 1:
                    team1 = `${owc_rank_icons[1]} :flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[2]}\n`;
                    break;
                case 3:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[3]}\n`;
                    break;
                case 5:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: **${match.team1_name} ${match.team1_score}** - `;
                    team2 = `${match.team2_score} ${match.team2_name} :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[4]}\n`;
                    break;
            }
        }
    } else {

        if (single) {

            switch (podium) {
                default:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: \n`;
                    break;
                case 1:
                    team1 = `${owc_rank_icons[2]} :flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[1]}\n`;
                    break;
                case 3:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[3]}\n`;
                    break;
                case 5:
                    team1 = `${owc_rank_icons[4]} :flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}:\n`;
                    break;
            }

        } else {

            switch (podium) {
                default:
                    team1 = `:flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: \n`;
                    break;
                case 1:
                    team1 = `${owc_rank_icons[2]} :flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}: ${owc_rank_icons[1]}\n`;
                    break;
                case 3:
                    team1 = `${owc_rank_icons[3]} :flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}:\n`;
                    break;
                case 5:
                    team1 = `${owc_rank_icons[4]} :flag_${code1.toLocaleLowerCase()}: ${match.team1_name} ${match.team1_score} - `;
                    team2 = `**${match.team2_score} ${match.team2_name}** :flag_${code2.toLocaleLowerCase()}:\n`;
                    break;
            }

        }
    }

    return `${team1}${team2}`;
}