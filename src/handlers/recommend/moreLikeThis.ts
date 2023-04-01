import { Client, Message } from "discord.js";
import { beatmap, getBeatmap } from "../../api/osu/beatmap";
import { buildMapEmbedMoreLikeThis, buildMapEmbedNoResponse, buildMapEmbedRecommendation } from "../../embeds/osu/beatmap/beatmap";
import { like } from "../../interfaces/Like";
import RecLike from "../../models/RecLike";
import Recommendation from "../../models/Recommendation";
import RecommendationInfo from "../../models/RecommendationInfo";
import axios from "axios";
import { Recommendation_data } from "../../api/commands/osu/recommend/recommend/recommend";
import { serverOffline } from "../../embeds/osu/recommend/recommend/error";
const DataImageAttachment = require("dataimageattachment");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

export default (client: Client) => {

    client.on('interactionCreate', async (interaction: any) => {

        if (interaction.customId != undefined) {
            const customid = interaction.customId;

            const interaction_discordid = interaction.user.id;

            const message: Message = interaction.message;

            const para = customid.split("_");

            if (para[0] == "morelike") {

                const discordid = para[2];

                if (discordid !== interaction_discordid) {
                    await interaction.deferReply({
                        ephemeral: true
                    });

                    const embed = new MessageEmbed()
                        .setColor(0x737df9)
                        .setTitle(`This is not your embed`)
                        .setDescription(`Please request your own \`!rec\``);

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                const method = para[1];
                let index: number = +para[3]
                const userid: number = +para[4];
                const source: string = para[5];

                switch (method) {
                    case "like": {

                        await interaction.deferReply({
                            ephemeral: true
                        });

                        let mode: string = "osu";

                        let split = source.split("_");

                        const like = new RecLike();
                        like.beatmapid = +split[0];
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.vote = "like";
                        like.osuid = userid;
                        like.value = source

                        await like.save();
                        await buildEmbed(message, index, userid, discordid, source);
                        await interaction.deferUpdate();
                        return;

                    }

                    case "dislike": {

                        await interaction.deferReply({
                            ephemeral: true
                        });

                        let mode: string = "osu";

                        let split = source.split("_");

                        const like = new RecLike();
                        like.beatmapid = +split[0];
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.vote = "dislike";
                        like.osuid = userid;
                        like.value = source

                        await like.save();
                        await buildEmbed(message, index, userid, discordid, source);
                        await interaction.deferUpdate();
                        return;
                    }

                    case "next": {

                        index++;

                        if (index > 10) {
                            index = 0;
                        }

                        await buildEmbed(message, index, userid, discordid, source);
                        await interaction.deferUpdate();
                        return;

                    }


                    case "prior": {

                        index--;

                        if (index < 0) {
                            index = 10;
                        }

                        await buildEmbed(message, index, userid, discordid, source);
                        await interaction.deferUpdate();
                        return;

                    }

                    case "more": {

                        await interaction.deferReply({
                        });

                        const recommendations = await getMoreLikeThis(userid, source);

                        let top10 = recommendations.slice(0, 10);

                        let split = top10[0].item.split("_");
                        let beatmapid = split[0];

                        const beatmap: beatmap = await getBeatmap(beatmapid);

                        const value = `${beatmap.id}_${split[1]}`

                        const { embed, result } = await buildMapEmbedMoreLikeThis(split[1], beatmap, 0, top10[0].score);

                        const row = new MessageActionRow();

                        const next = new MessageButton().
                            setCustomId(`morelike_next_${discordid}_0_${userid}_${source}`)
                            .setEmoji("951821813460115527")
                            .setStyle("PRIMARY");

                        const prior = new MessageButton().
                            setCustomId(`morelike_prior_${discordid}_0_${userid}_${source}`)
                            .setEmoji("951821813288140840")
                            .setStyle("PRIMARY");

                        const upvote = new MessageButton()
                            .setCustomId(`morelike_like_${discordid}_0_${userid}_${source}_${value}`)
                            .setEmoji("955320158270922772")
                            .setStyle("SUCCESS");

                        const downvote = new MessageButton()
                            .setCustomId(`morelike_dislike_${discordid}_0_${userid}_${source}_${value}`)
                            .setEmoji("955319940435574794")
                            .setStyle("DANGER");

                        const morelike = new MessageButton()
                            .setCustomId(`morelike_morelike_${discordid}_0_${userid}_${source}_${value}`)
                            .setLabel("More like this")
                            .setStyle("PRIMARY");

                        row.addComponents([prior, upvote, downvote, next]);

                        interaction.editReply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
                        break;


                    }

                }

            }

        }

    })
}

async function buildEmbed(interaction: any, index: number, userid: any, discordid: any, source: string) {

    const rec = await getMoreLikeThis(userid, source);

    if (rec.length == 0) {
        const errorEmbed = new MessageEmbed()
            .setColor(0x737df9)
            .setTitle(`No recommendations`)
            .setDescription(`Quna currently has no personal recommendations for you.\nUse a filter to find normal maps`)
        await interaction.edit({ embeds: [errorEmbed] })
    }

    let top10 = rec.slice(index, 10);

    let split = top10[0].item.split("_");
    let beatmapid = split[0];


    const beatmap = await getBeatmap(beatmapid);
    const { embed, result } = await buildMapEmbedMoreLikeThis(split[1], beatmap, index, top10[0].score);

    const row = new MessageActionRow();

    const next = new MessageButton().
        setCustomId(`morelike_next_${discordid}_${index}_${userid}_${source}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`morelike_prior_${discordid}_${index}_${userid}_${source}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`morelike_like_${discordid}_${index}_${userid}_${source}_${top10[0]}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`morelike_dislike_${discordid}_${index}_${userid}_${source}_${top10[0]}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    const morelike = new MessageButton()
        .setCustomId(`morelike_morelike_${discordid}_${index}_${userid}_${source}_${top10[0]}`)
        .setLabel("More like this")
        .setStyle("PRIMARY");

    row.addComponents([prior, upvote, downvote, next, morelike]);

    await interaction.editReply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
}

export async function getMoreLikeThis(userid: number, source: string): Promise<Recommendation_data[]> {

    let recommendations: Recommendation_data[] = [];

    try {
        const resp = await axios.get<Recommendation_data[]>(`http://127.0.0.1:8082/morelike/${userid}/${source}?count=100`);
        recommendations = resp.data;

    } catch (e: any) {
    }

    return recommendations;
}