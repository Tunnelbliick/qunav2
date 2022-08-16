import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import Recommendation from "../../../models/Recommendation";
import { categorieLabeledchart } from "../../chart.js/recommend/categories";
import { launcCollector } from "./collector";
const DataImageAttachment = require("dataimageattachment");

export async function categoryvote(currentid: any, userid: any, interaction: any) {

    let recommendation: any = await Recommendation.findOne({ _id: currentid });

    let categories = recommendation.type;

    let chart = await categorieLabeledchart(categories);

    let row = new MessageActionRow();

    let components: any = [];

    let ids: any = [];

    let recommendationembed = new MessageEmbed()
        .setAuthor({ name: `Upvote Categories for this Suggestion` })
        .setColor(0x737df9)
        .setTitle(`${recommendation.artist} - ${recommendation.title} [${recommendation.version}]`)
        .setImage("attachment://categories.png")
        .setURL(`https://osu.ppy.sh/beatmaps/${recommendation.mapid}`)

    categories.forEach((category: any) => {

        let id = `category_vote_${category.category}_${currentid}_${userid}`

        let vote = new MessageButton()
            .setCustomId(id)
            .setLabel(`${category.category} + 1`)
            .setStyle("PRIMARY");

        ids.push(id);
        components.push(vote);

    })

    row.setComponents(components);

    launcCollector(ids, interaction, components);

    return { embeds: [recommendationembed], components: [row], files: [new DataImageAttachment(chart, "categories.png")] };

}