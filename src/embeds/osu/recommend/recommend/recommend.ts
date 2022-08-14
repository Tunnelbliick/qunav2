import { MessageEmbed } from "discord.js";
import { calcualteStatsFromBeatmapforMods, calcualteStatsFromSuggestion } from "../../../../api/beatmaps/stats";
import { categoriechart } from "../../../../api/chart.js/recommend/categories";
import { updownvote } from "../../../../api/chart.js/recommend/upvotes";
import { getDifficultyColor } from "../../../../utility/gradiant";
const { createCanvas, loadImage } = require('canvas')

export async function buildDownvote(recommendation: any, index: any) {

    let downvote = new MessageEmbed()
    .setColor("#ed4245")
    .setTitle(`${recommendation.artist} - ${recommendation.title} [${recommendation.version}]`)
    .setDescription(`Successfully downvoted ${recommendation.title} [${recommendation.version}]`)
    .setURL(`https://osu.ppy.sh/beatmaps/${recommendation.mapid}`)
    //.setFooter({text: `Tipp! Use !tag ${index} <tags> to vote on the tags of this beatmap`})

    return downvote;
}

export async function buildUpvote(recommendation: any, index: any) {

    let upvote = new MessageEmbed()
    .setColor("#3ba55d")
    .setTitle(`${recommendation.artist} - ${recommendation.title} [${recommendation.version}]`)
    .setDescription(`Successfully upvoted ${recommendation.title} [${recommendation.version}]`)
    .setURL(`https://osu.ppy.sh/beatmaps/${recommendation.mapid}`)
    //.setFooter({text: `Tipp! Use !tag ${index} <tags> to vote on the tags of this beatmap`})

    return upvote;
}

export async function buildRecommendation(recommendation: any, index: any, max: any) {
    let embedColor = getDifficultyColor(recommendation.star);
    let mods = [];
    let typestring = "";

    if (recommendation.mods != undefined)
        mods = recommendation.mods;
    let bpm = recommendation.bpm;

    let stats = calcualteStatsFromSuggestion(recommendation);

    let mString = "";

    for (let m of mods) {
        mString += `\`${m}\` `;
    }

    if (mString == "") {
        mString = `\`NM\``;
    }

    for (let t of recommendation.type) {
        typestring += `\`${t.category}\` `;
    }

    let upvotedownvoteChart = await updownvote(recommendation);
    let typesChart = await categoriechart(recommendation);

    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')

    let upvoteDownvote = await loadImage(upvotedownvoteChart);
    let types = await loadImage(typesChart);

    ctx.drawImage(upvoteDownvote, 0, 0); // Or at whatever offset you like
    ctx.drawImage(types, canvas.width - types.width, 0);

    let canvasBase = await canvas.toDataURL();

    // index is 0 bound display starts from 1 tho
    index++;

    let recommendationembed = new MessageEmbed()
        .setAuthor({ name: `Personal beatmap recommendation (${index}/${max}` })
        .setColor(embedColor)
        .setTitle(`${recommendation.artist} - ${recommendation.title} [${recommendation.version}]`)
        .setImage("attachment://recommendation.png")
        .setDescription(`Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) BPM: \`${bpm}\` Objects: \`${recommendation.circles + recommendation.sliders + recommendation.spinners}\`\n` +
            `CS:\`${recommendation.cs}\` AR:\`${recommendation.ar}\` OD:\`${recommendation.od}\` HP:\`${recommendation.hp}\` Stars: \`${recommendation.star}★\``)
        .setFields([{
            name: `Mods`,
            value: mString,
            inline: false
        }, {
            name: `Categories`,
            value: typestring,
            inline: false,
        }])
        .setURL(`https://osu.ppy.sh/beatmaps/${recommendation.mapid}`)

        return {embed: recommendationembed, img: canvasBase};
}