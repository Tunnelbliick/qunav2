import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { buildCategoryVoteEmbed } from "../../../embeds/osu/recommend/categoryvote/categoryvote";
import Recommendation from "../../../models/Recommendation";
import { categorieLabeledchart } from "../../chart.js/recommend/categories";
import { launcCollector } from "./collector";
const DataImageAttachment = require("dataimageattachment");

export async function categoryvote(currentid: any, userid: any, interaction: any) {

    const recommendation: any = await Recommendation.findOne({ _id: currentid });

    const categories = recommendation.type;

    const chart = await categorieLabeledchart(categories);

    const row = new MessageActionRow();

    const components: any = [];

    const ids: any = [];

    const recommendationembed = buildCategoryVoteEmbed(recommendation, null);

    categories.forEach((category: any) => {

        const id = `category_vote_${category.category}_${currentid}_${userid}`

        const vote = new MessageButton()
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