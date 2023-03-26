import { Client, Message } from "discord.js";
import { getBeatmap } from "../../api/osu/beatmap";
import { buildMapEmbedNoResponse, buildMapEmbedRecommendation } from "../../embeds/osu/beatmap/beatmap";
import { like } from "../../interfaces/Like";
import RecLike from "../../models/RecLike";
import Recommendation from "../../models/Recommendation";
import RecommendationInfo from "../../models/RecommendationInfo";
const DataImageAttachment = require("dataimageattachment");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

export default (client: Client) => {

    client.on('interactionCreate', async (interaction: any) => {

        if (interaction.customId != undefined) {
            const customid = interaction.customId;

            const interaction_discordid = interaction.user.id;

            const message: Message = interaction.message;

            const para = customid.split("_");

            if (para[0] == "recommendation") {

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

                const recInfo = await RecommendationInfo.findOne({ osuid: userid })

                if (recInfo == null || recInfo == undefined) {
                    const embed = new MessageEmbed()
                        .setColor(0x737df9)
                        .setTitle(`Something went wrong`)
                        .setDescription(`Please contact us on discord if this issue keeps poping up!`);

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                switch (method) {
                    case "like": {

                        await interaction.deferReply({
                            ephemeral: true
                        });

                        const rec_id: any = para[5];

                        const current_recommendations = await Recommendation.findOne({ _id: rec_id });

                        if (current_recommendations == null || current_recommendations == undefined) {
                            const embed = new MessageEmbed()
                                .setColor(0x737df9)
                                .setTitle(`Something went wrong`)
                                .setDescription(`Please contact us on discord if this issue keeps poping up!`);

                            await interaction.editReply({ embeds: [embed] });
                            return;
                            break;
                        }

                        let mode: String = "osu";

                        if(current_recommendations.mode !== null && current_recommendations.mode !== undefined) {
                            mode = current_recommendations.mode;
                        }

                        let like = new RecLike();
                        like.beatmapid = +current_recommendations.mapid;
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.vote = "like";
                        like.osuid = userid;
                        like.value = `${current_recommendations.mapid}_${current_recommendations.mods.join("")}`

                        recInfo.length = +recInfo.length - 1;

                        await Promise.all([
                            like.save(),
                            recInfo.save(),
                            current_recommendations.delete()
                          ]);

                        await buildEmbed(message, index, userid, discordid, recInfo);

                        const upvote = new MessageEmbed()
                            .setColor(0x737df9)
                            .setTitle(`Successfully liked Beatmap`)
                            .setDescription(`You have liked this beatmap.`)

                        await interaction.editReply({ embeds: [upvote] });
                        return;
                        break;

                    }

                    case "dislike": {

                        await interaction.deferReply({
                            ephemeral: true
                        });

                        const rec_id: any = para[5];

                        const current_recommendations = await Recommendation.findOne({ _id: rec_id });

                        if (current_recommendations == null || current_recommendations == undefined) {
                            const embed = new MessageEmbed()
                                .setColor(0x737df9)
                                .setTitle(`Something went wrong`)
                                .setDescription(`Please contact us on discord if this issue keeps poping up!`);

                            await interaction.editReply({ embeds: [embed] });
                            return;
                            break;
                        }

                        
                        let mode: String = "osu";

                        if(current_recommendations.mode !== null && current_recommendations.mode !== undefined) {
                            mode = current_recommendations.mode;
                        }

                        let like = new RecLike();
                        like.beatmapid = +current_recommendations.mapid;
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.vote = "dislike";
                        like.osuid = userid;
                        like.value = `${current_recommendations.mapid}_${current_recommendations.mods.join("")}`

                        recInfo.length = +recInfo.length - 1;

                        await Promise.all([
                            like.save(),
                            recInfo.save(),
                            current_recommendations.delete()
                          ]);

                        await buildEmbed(message, index, userid, discordid, recInfo);

                        const upvote = new MessageEmbed()
                            .setColor(0x737df9)
                            .setTitle(`Successfully disliked Beatmap`)
                            .setDescription(`You have disliked this beatmap.`)

                        await interaction.editReply({ embeds: [upvote] });
                        return;
                        break;
                    }

                    case "next": {

                        index++;

                        if (index > (+recInfo.length - 1)) {
                            index = 0;
                        }

                        await buildEmbed(message, index, userid, discordid, recInfo);
                        await interaction.deferUpdate();
                        return;

                    }


                    case "prior": {

                        index--;

                        if (index < 0) {
                            index = (+recInfo.length - 1);
                        }

                        await buildEmbed(message, index, userid, discordid, recInfo);
                        await interaction.deferUpdate();
                        return;

                    }

                }

            }

        }

    })
}

async function buildEmbed(message: any, index: number, userid: any, discordid: any, recInfo: any) {

    const rec = await Recommendation.find({ osuid: userid }).sort({ score: -1 }).skip(index).limit(1).exec();

    if (rec.length == 0) {
        const errorEmbed = new MessageEmbed()
            .setColor(0x737df9)
            .setTitle(`No recommendations`)
            .setDescription(`Quna currently has no personal recommendations for you.\nUse a filter to find normal maps`)
        await message.edit({ embeds: [errorEmbed] })
    }


    const beatmap = await getBeatmap(rec[0].mapid);
    const value = `${rec[0].mapid}_${rec[0].mods.join("")}`
    const { embed, result } = await buildMapEmbedRecommendation(rec[0], beatmap, index, recInfo);

    const row = new MessageActionRow();

    const next = new MessageButton().
        setCustomId(`recommendation_next_${discordid}_${index}_${userid}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`recommendation_prior_${discordid}_${index}_${userid}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`recommendation_like_${discordid}_${index}_${userid}_${rec[0].id}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`recommendation_dislike_${discordid}_${index}_${userid}_${rec[0].id}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    row.addComponents([prior, upvote, downvote, next]);

    await message.edit({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
}