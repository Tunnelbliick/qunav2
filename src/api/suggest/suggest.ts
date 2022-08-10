import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { invalidcategorie } from "../../embeds/osu/recommend/suggest/error";
import Category from "../../models/Category";
import { getDifficultyColor } from "../../utility/gradiant";
import { calcualteStatsFromBeatmapforMods } from "../beatmaps/stats";
import { parseModString } from "../osu/utility/parsemods";
import { loaddifficulty } from "../pp/db/loaddifficutly";
import { launchSuggestionCollector, suggestion_collector_params } from "./collector";

export interface suggestion {
    beatmap: any,
    mod_string: any,
    categories: any
}

export async function suggest(suggestion: suggestion, message: any, prefix: any) {

    const beatmap = suggestion.beatmap;
    const mods = parseModString(suggestion.mod_string);
    const categories = suggestion.categories;
    const stats = calcualteStatsFromBeatmapforMods(beatmap, mods);
    const difficulty: any = await loaddifficulty(beatmap.id, beatmap.checksum, mods, beatmap.mode);
    const embedColor = getDifficultyColor(difficulty.star);
    const category_objects: any = await Category.find({});


    let error;
    let categories_string = "";
    let mod_string = "";
    let available_categoreis = [];

    for (let category of category_objects) {
        available_categoreis.push(category.name);
    }

    for (let c of categories) {
        if (!available_categoreis.includes(c))
            error = c;
        else
            categories_string += `\`${c}\` `;
    }

    if (error) {
        invalidcategorie(message, error, prefix);
        return;
    }

    for (let m of mods) {
        mod_string += `\`${m}\` `;
    }

    if (mod_string === "") {
        mod_string = `\`NM\``;
    }

    let suggestion_embed = new MessageEmbed()
        .setAuthor({ name: `Confirm Beatmap Suggestion` })
        .setColor(embedColor)
        .setTitle(`${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`)
        .setImage(`${beatmap.beatmapset.covers.cover}`)
        .setDescription(`Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) BPM: \`${stats.bpm}\` Objects: \`${beatmap.count_circles + beatmap.count_sliders + beatmap.count_spinners}\`\n` +
            `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` Stars: \`${difficulty.star.toFixed(2)}★\``)
        .setFields([{
            name: `Mods`,
            value: mod_string,
            inline: false
        }, {
            name: `Categories`,
            value: categories_string,
            inline: false,
        }])
        .setURL(`${beatmap.url}`)

    const row = new MessageActionRow();
    let suggest = new MessageButton().setCustomId(`suggest_${message.id}_${message.author.id}`).setLabel("Suggest").setStyle("SUCCESS");
    let discard = new MessageButton().setCustomId(`discard_${message.id}_${message.author.id}`).setLabel("Discard").setStyle("SECONDARY");

    row.addComponents([suggest, discard]);

    let msg = await message.reply({ embeds: [suggestion_embed], components: [row] });

    let collector_params: suggestion_collector_params = {
        beatmap: beatmap,
        difficulty: difficulty,
        stats: stats,
        categories: categories,
        mods: mods,
        message: msg,
        discard: discard,
        suggest: suggest,
        embed: suggestion_embed,
        row: row,
    }

    launchSuggestionCollector(collector_params);

}