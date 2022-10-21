import { MessageEmbed } from "discord.js";
import { country_overwrite } from "../../embeds/osu/owc/country_overwrites";
import owc from "../../models/owc";
import owcteam from "../../models/owcteam";
import { owc_gamemode_icons } from "../../utility/icons";
import { buildfilter, owc_filter } from "./filter";

const { getCode } = require('country-list');

country_overwrite();

interface placement {
    mode: String,
    place: number,
}

export async function compareworldcups(message: any, interaction: any, args: any, default_mode: any) {

    const filter: owc_filter = buildfilter(interaction, args, default_mode)!;

    let tournaments: any;

    if (filter.mode !== undefined) {
        tournaments = await owc.find({ mode: filter.mode });
    } else {
        tournaments = await owc.find({});
    }

    const tournament_ids = tournaments.map((t: any) => {
        if(t.mode !== "catch" || t.year !== "2012") return t.id
    });

    const teams = await owcteam.find({ owc: { $in: [...tournament_ids] }, place: { $in: [1, 2, 3] } });

    let team_placements: Map<string, placement[]> = new Map<string, placement[]>();

    teams.forEach((t: any) => {
        const placement = { mode: t.mode, place: t.place };
        let placements: any = team_placements.get(t.name);

        if (placements === undefined) {
            placements = [];
        }

        placements.push(placement);

        team_placements.set(t.name, placements)
    });

    team_placements = new Map([...team_placements].sort((a: any, b: any) => b[1].length - a[1].length));

    let description = "";

    team_placements.forEach((v: any, k: string) => {

        if (new RegExp(/\s\w$/g).test(k)) {
            return;
        }

        const code: string = getCode(k);
        const medals = v.sort((a: any, b: any) => {
            if (a.place === b.place) {
                return ('' + a.mode).localeCompare(b.mode);
            }
            return a.place - b.place;
        });

        description += `:flag_${code.toLocaleLowerCase()}: `

        medals.forEach((medal: placement) => {
            const emote = owc_gamemode_icons[`${medal.mode}${medal.place}`]
            description += `${emote}`;
        })

        description += "\n";

    });


    const embed = new MessageEmbed().
        setTitle(`Comparing World Cup Teams`)
        .setColor("#4b67ba")
        .setDescription(description)

    let reply;

    if (interaction != null) {
        reply = await interaction.editReply({ embeds: [embed] });
    } else {
        reply = await message.reply({ embeds: [embed] })
    }
    return;

}
