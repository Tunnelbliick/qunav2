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
                        }

                        let mode: string = "osu";

                        if (current_recommendations.mode !== null && current_recommendations.mode !== undefined) {
                            mode = current_recommendations.mode;
                        }

                        const like = new RecLike();
                        like.beatmapid = +current_recommendations.mapid;
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.vote = "like";
                        like.osuid = userid;
                        like.value = `${current_recommendations.mapid}_${current_recommendations.mods.join("")}`

                        recInfo.length = +recInfo.length - 1;

                        if (index == recInfo.length) {
                            index--;
                        }

                        recInfo.currentIndex = index;

                        await Promise.all([
                            like.save(),
                            recInfo.save(),
                            current_recommendations.delete()
                        ]);

                        await buildEmbed(message, index, userid, discordid, recInfo);
                        await interaction.deferUpdate();
                        return;

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


                        let mode: string = "osu";

                        if (current_recommendations.mode !== null && current_recommendations.mode !== undefined) {
                            mode = current_recommendations.mode;
                        }

                        const like = new RecLike();
                        like.beatmapid = +current_recommendations.mapid;
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.vote = "dislike";
                        like.osuid = userid;
                        like.value = `${current_recommendations.mapid}_${current_recommendations.mods.join("")}`

                        recInfo.length = +recInfo.length - 1;

                        if (index == recInfo.length) {
                            index--;
                        }

                        recInfo.currentIndex = index;

                        await Promise.all([
                            like.save(),
                            recInfo.save(),
                            current_recommendations.delete()
                        ]);

                        await buildEmbed(message, index, userid, discordid, recInfo);
                        await interaction.deferUpdate();
                        return;
                    }

                    case "next": {

                        index++;

                        if (index > (+recInfo.length - 1)) {
                            index = 0;
                        }

                        recInfo.currentIndex = index;
                        recInfo.save();

                        await buildEmbed(message, index, userid, discordid, recInfo);
                        await interaction.deferUpdate();
                        return;

                    }


                    case "prior": {

                        index--;

                        if (index < 0) {
                            index = (+recInfo.length - 1);
                        }

                        recInfo.currentIndex = index;
                        recInfo.save();

                        await buildEmbed(message, index, userid, discordid, recInfo);
                        await interaction.deferUpdate();
                        return;

                    }

                    case "more": {

                        await interaction.deferReply({
                        });


                        let recommendations: Recommendation_data[] = [];
                        const rec_id: any = para[5];
                        const current_recommendations = await Recommendation.findOne({ _id: rec_id });

                        if (current_recommendations == null) {
                            return;
                        }

                        const source = `${current_recommendations.mapid}_${current_recommendations.mods.join("")}`;

                        try {
                            await axios.get<Recommendation_data[]>(`http://127.0.0.1:8082/morelike/${userid}/${source}?count=100`).then((resp: any) => {
                                recommendations = resp.data;
                            })
                        } catch (e: any) {

                            if (e.code === 'ECONNREFUSED') {
                                serverOffline(message);
                                return;
                            }
                        }

                        let top10 = recommendations.slice(0, 10);

                        let split = top10[0].item.split("_");
                        let beatmapid = split[0];

                        const beatmap: beatmap = await getBeatmap(beatmapid);

                        const value = `${beatmap.id}-${split[1]}`

                        const { embed, result } = await buildMapEmbedMoreLikeThis(split[1], beatmap, 0, top10[0].score);

                        const row = new MessageActionRow();

                        const button_source = `${current_recommendations.mapid}-${current_recommendations.mods.join("")}`;

                        const next = new MessageButton().
                            setCustomId(`morelike_next_${discordid}_0_${userid}_${button_source}`)
                            .setEmoji("951821813460115527")
                            .setStyle("PRIMARY");

                        const prior = new MessageButton().
                            setCustomId(`morelike_prior_${discordid}_0_${userid}_${button_source}`)
                            .setEmoji("951821813288140840")
                            .setStyle("PRIMARY");

                        const upvote = new MessageButton()
                            .setCustomId(`morelike_like_${discordid}_0_${userid}_${button_source}_${value}`)
                            .setEmoji("955320158270922772")
                            .setStyle("SUCCESS");

                        const downvote = new MessageButton()
                            .setCustomId(`morelike_dislike_${discordid}_0_${userid}_${button_source}_${value}`)
                            .setEmoji("955319940435574794")
                            .setStyle("DANGER");

                        const morelike = new MessageButton()
                            .setCustomId(`morelike_more_${discordid}_0_${userid}_${button_source}_${value}`)
                            .setLabel("More like this")
                            .setStyle("PRIMARY");

                        row.addComponents([prior, upvote, downvote, next, morelike]);

                        interaction.editReply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
                        break;


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

    const more = new MessageButton()
        .setCustomId(`recommendation_more_${discordid}_${index}_${userid}_${rec[0].id}`)
        .setLabel("More like this")
        .setStyle("PRIMARY");

    row.addComponents([prior, upvote, downvote, next, more]);

    await message.edit({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
}