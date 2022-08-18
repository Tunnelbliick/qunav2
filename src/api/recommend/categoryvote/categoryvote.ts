import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { buildCategoryVoteEmbed } from "../../../embeds/osu/recommend/categoryvote/categoryvote";
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

    let recommendationembed = buildCategoryVoteEmbed(recommendation, null);

    categories.forEach((category: any) => {

        let id = `category_vote_${category.category}_${currentid}_${userid}`

        let vote = new MessageButton()
            .setCustomId(id)
            .setLabel(`⬆️ ${category.category}`)
            .setStyle("PRIMARY");

        ids.push(id);
        components.push(vote);

    })

    row.setComponents(components);

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ embeds: [recommendationembed], components: [row], files: [new DataImageAttachment(chart, "categories.png")] });

    launcCollector(ids, interaction, components, row);

}