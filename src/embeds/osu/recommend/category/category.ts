import { MessageEmbed } from "discord.js";

export function buildUpvote(recommendation: any, category: any) {

    let upvote = new MessageEmbed()
    .setColor("#3ba55d")
    .setTitle(`${recommendation.artist} - ${recommendation.title} [${recommendation.version}]`)
    .setDescription(`Successfully upvoted category \`${category}\``)
    .setURL(`https://osu.ppy.sh/beatmaps/${recommendation.mapid}`)
    //.setFooter({text: `Tipp! Use !tag ${index} <tags> to vote on the tags of this beatmap`})

    return upvote;
}