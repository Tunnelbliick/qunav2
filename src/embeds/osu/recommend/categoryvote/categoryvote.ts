import { MessageEmbed } from "discord.js";

export function buildCategoryVoteEmbed(suggestion: any, prefix: any) {
    const recommendationembed = new MessageEmbed()
    .setAuthor({ name: `Upvote Categories for this Suggestion` })
    .setColor(0x737df9)
    .setTitle(`${suggestion.artist} - ${suggestion.title} [${suggestion.version}]`)
    .setImage("attachment://categories.png")
    .setURL(`https://osu.ppy.sh/beatmaps/${suggestion.mapid}`)

    return recommendationembed;
}