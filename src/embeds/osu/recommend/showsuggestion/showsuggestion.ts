import { MessageEmbed } from "discord.js";
import { calcualteStatsFromSuggestion } from "../../../../api/beatmaps/stats";

export interface show_suggestion_embed {
    suggestions: any,
    max: any
    current_page: any,
    user: any
}

export async function buildshowSuggestions(params: show_suggestion_embed) {

    const pagecontent = params.suggestions;
    const user = params.user;
    const max = params.max;
    const current_page = params.current_page;

    let fields: any = "";

    for (let content of pagecontent) {

        let stats = calcualteStatsFromSuggestion(content);

        let mods: Array<String> = content.mods;
        let appliedmods: any = "+";
        mods.forEach(m => { appliedmods += m });

        let categories: Array<String> = content.type;
        let appliedcategories: any = "";
        categories.forEach((t: any) => { appliedcategories += `\`${t.category}\` ` });

        let field: any = `[**${content.artist} - ${content.title} [${content.version}]**](https://osu.ppy.sh/beatmaps/${content.mapid})  ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} \n` +
            `Category: ${appliedcategories}\n` +
            `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) BPM: \`${content.bpm}\` Objects: \`${stats.total_objects}\`\n` +
            `CS:\`${content.cs}\` AR:\`${content.ar}\` OD:\`${content.od}\` HP:\`${content.hp}\` Stars: \`${content.star}★\`\n\n`;

        fields += field;
    }

    if (fields == "") {
        fields = `No recommendations were found.`; // or if your Arumi: OI! you dont have anny recommendations... // shut the fuck up LOL
    }

    let max_page = Math.ceil(max / 5);

    let recommendationlist

    recommendationlist = new MessageEmbed()
        .setThumbnail(`${user.avatar_url}`)
        .setAuthor({ name: `${user.username}'s recommendation(s)`, iconURL: `${user.avatar_url}` })
        .setColor(0x737df9)
        .setDescription(fields)

    if (max_page > 0) {
        recommendationlist.setFooter({ text: `Page ${current_page + 1}/${max_page}` });
    }

    return recommendationlist;
}