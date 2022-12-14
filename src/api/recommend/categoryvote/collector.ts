import { id } from "osu-api-extended/dist/utility/mods";
import { buildUpvote } from "../../../embeds/osu/recommend/category/category";
import { alraedyUpvoted } from "../../../embeds/osu/recommend/category/error";
import { buildCategoryVoteEmbed } from "../../../embeds/osu/recommend/categoryvote/categoryvote";
import Recommendation from "../../../models/Recommendation";
import User from "../../../models/User";
import { encrypt } from "../../../utility/encrypt";
const DataImageAttachment = require("dataimageattachment");

export async function launcCollector(ids: Array<any>, interaction: any, components: any, row: any) {

    const filter = (i: any) => {
        return ids.includes(i.customId);
    }

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 })

    collector.on("collect", async (i: any) => {

        const params = i.customId.split("_");
        const category_string: any = params[2];
        const currentid = params[3];

        await i.deferReply({ ephemeral: true });

        const userObject: any = await User.findOne({ discordid: await encrypt(i.user.id) });

        const recommendation: any = await Recommendation.findOne({ _id: currentid });

        const categories: any = recommendation.type;

        const index = categories.findIndex((category: any) => category.category === category_string);

        const category = categories[index];

        const upvotes = category.upvote;

        if (upvotes.includes(userObject.userid) === false) {

            upvotes.push(userObject.userid);
            category.upvote = upvotes;

            categories[index] = category;

            await Recommendation.updateOne({ _id: currentid }, { type: categories });

            const embed = buildUpvote(recommendation, category_string);

            await i.editReply({ embeds: [embed] });

        } else {

            const embed = alraedyUpvoted(recommendation, category_string);

            await i.editReply({ embeds: [embed] });

        }

    })

    collector.on("end", async () => {

        components.forEach((button: any) => button.setDisabled(true));

        await interaction.editReply({ components: [row]});

    })
}