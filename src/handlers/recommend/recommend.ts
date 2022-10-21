import { Client, Message } from "discord.js";
import { categoryvote } from "../../api/recommend/categoryvote/categoryvote";
import { buildDownvote, buildRecommendation, buildUpvote } from "../../embeds/osu/recommend/recommend/recommend";
import Recommendation from "../../models/Recommendation";
import RecommndationList from "../../models/RecommndationList";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
const DataImageAttachment = require("dataimageattachment");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { createCanvas } = require('canvas')

const Procyon = require('procyon')

export default (client: Client) => {

    var procyon: any = new Procyon({
        className: 'maps'
    });

    client.on('interactionCreate', async (interaction: any) => {

        if (interaction.customId != undefined) {
            const customid = interaction.customId;

            const message: Message = interaction.message;

            const para = customid.split("_");

            const userObject: any = await User.findOne({ discordid: await encrypt(interaction.user.id) });

            if (para[0] == "recommendation") {

                const method = para[1];
                const userid = para[2];
                let index = para[3];
                const reclistid = para[4];
                let currentid = para[5];

                switch (method) {
                    case "upvote": {

                        const recommendation: any = await Recommendation.findOne({ _id: currentid });

                        currentid = recommendation.id;

                        const row = new MessageActionRow();

                        const canvas = createCanvas(1, 1);
                        const img = await canvas.toDataURL();

                        const next = new MessageButton().
                            setCustomId(`recommendation_next_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("951821813460115527")
                            .setStyle("PRIMARY");

                        const prior = new MessageButton().
                            setCustomId(`recommendation_prior_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("951821813288140840")
                            .setStyle("PRIMARY");

                        const upvote = new MessageButton()
                            .setCustomId(`recommendation_upvote_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("955320158270922772")
                            .setStyle("SUCCESS");

                        const downvote = new MessageButton()
                            .setCustomId(`recommendation_downvote_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("955319940435574794")
                            .setStyle("DANGER");

                        const vote = new MessageButton().
                            setCustomId(`recommendation_vote_${userid}_${index}_${reclistid}_${currentid}`)
                            .setLabel("Vote")
                            .setStyle("PRIMARY");


                        row.setComponents([prior, upvote, downvote, next, vote]);

                        const embed = await buildUpvote(recommendation, index);

                        await procyon.liked(index, currentid);
                        await Recommendation.updateOne({ _id: currentid }, { $addToSet: { upvote: userObject.userid }, $pull: { downvote: userObject.userid } });
                        await interaction.deferReply({
                            ephemeral: true
                        });
                        await interaction.editReply({ embeds: [embed] });
                        return;
                        break;

                    }

                    case "downvote": {

                        const recommendation: any = await Recommendation.findOne({ _id: currentid });

                        currentid = recommendation.id;

                        const row = new MessageActionRow();

                        const next = new MessageButton().
                            setCustomId(`recommendation_next_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("951821813460115527")
                            .setStyle("PRIMARY");

                        const prior = new MessageButton().
                            setCustomId(`recommendation_prior_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("951821813288140840")
                            .setStyle("PRIMARY");

                        const upvote = new MessageButton()
                            .setCustomId(`recommendation_upvote_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("955320158270922772")
                            .setStyle("SUCCESS");

                        const downvote = new MessageButton()
                            .setCustomId(`recommendation_downvote_${userid}_${index}_${reclistid}_${currentid}`)
                            .setEmoji("955319940435574794")
                            .setStyle("DANGER");

                        const vote = new MessageButton().
                            setCustomId(`recommendation_vote_${userid}_${index}_${reclistid}_${currentid}`)
                            .setLabel("Vote")
                            .setStyle("PRIMARY");


                        row.setComponents([prior, upvote, downvote, next, vote]);

                        const embed = await buildDownvote(recommendation, index);

                        await procyon.disliked(index, currentid);
                        await Recommendation.updateOne({ _id: currentid }, { $addToSet: { downvote: userObject.userid }, $pull: { upvote: userObject.userid } });
                        await interaction.deferReply({
                            ephemeral: true
                        });
                        await interaction.editReply({ embeds: [embed] });
                        return;

                    }

                    case "next": {

                        const reclist = await RecommndationList.findById({ _id: reclistid });

                        if (reclist != undefined) {

                            const max = reclist.mongoids.length;

                            if (index == max) {

                                const canvas = createCanvas(1, 1)

                                const img = await canvas.toDataURL();

                                const errorEmbed = new MessageEmbed()
                                    .setColor(0x737df9)
                                    .setTitle(`No more recommendations`)
                                    .setImage("attachment://recommendation.png")
                                    .setDescription(`Quna currently has no more personal recommendations for you.\n\nUse a filter to find more maps`)

                                const row = new MessageActionRow();

                                const next = new MessageButton().
                                    setCustomId(`recommendation_next_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("951821813460115527")
                                    .setStyle("PRIMARY");

                                const prior = new MessageButton().
                                    setCustomId(`recommendation_prior_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("951821813288140840")
                                    .setStyle("PRIMARY");

                                const upvote = new MessageButton()
                                    .setCustomId(`recommendation_upvote_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("955320158270922772")
                                    .setStyle("SUCCESS");

                                const downvote = new MessageButton()
                                    .setCustomId(`recommendation_downvote_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("955319940435574794")
                                    .setStyle("DANGER");

                                const vote = new MessageButton().
                                    setCustomId(`recommendation_vote_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setLabel("Vote")
                                    .setStyle("PRIMARY");


                                row.setComponents([prior, upvote, downvote, next, vote]);

                                await message.edit({ embeds: [errorEmbed], components: [row], files: [new DataImageAttachment(img, "recommendation.png")] });
                                await interaction.deferUpdate();
                                return;

                            }

                            if (index < max) {

                                index++;

                            }

                            const recommendation: any = await Recommendation.findOne({ _id: reclist.mongoids[index] });
                            currentid = recommendation.id;

                            const row = new MessageActionRow();

                            const next = new MessageButton().
                                setCustomId(`recommendation_next_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("951821813460115527")
                                .setStyle("PRIMARY");

                            const prior = new MessageButton().
                                setCustomId(`recommendation_prior_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("951821813288140840")
                                .setStyle("PRIMARY");

                            const upvote = new MessageButton()
                                .setCustomId(`recommendation_upvote_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("955320158270922772")
                                .setStyle("SUCCESS");

                            const downvote = new MessageButton()
                                .setCustomId(`recommendation_downvote_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("955319940435574794")
                                .setStyle("DANGER");


                            const vote = new MessageButton().
                                setCustomId(`recommendation_vote_${userid}_${index}_${reclistid}_${currentid}`)
                                .setLabel("Vote")
                                .setStyle("PRIMARY");


                            row.setComponents([prior, upvote, downvote, next, vote]);

                            const result: any = await buildRecommendation(recommendation, index, max);

                            await message.edit({ embeds: [result.embed], components: [row], files: [new DataImageAttachment(result.img, "recommendation.png")] });
                            await interaction.deferUpdate();
                            return;
                        }

                        break;

                    }


                    case "prior": {

                        const reclist: any = await RecommndationList.findById({ _id: reclistid });

                        const max = reclist.mongoids.length;

                        if (reclist != undefined) {

                            if (index == 0) {

                                const recommendation: any = await Recommendation.findOne({ _id: reclist.mongoids[index] });

                                const row = new MessageActionRow();

                                const next = new MessageButton().
                                    setCustomId(`recommendation_next_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("951821813460115527")
                                    .setStyle("PRIMARY");

                                const prior = new MessageButton().
                                    setCustomId(`recommendation_prior_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("951821813288140840")
                                    .setStyle("PRIMARY");

                                const upvote = new MessageButton()
                                    .setCustomId(`recommendation_upvote_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("955320158270922772")
                                    .setStyle("SUCCESS");

                                const downvote = new MessageButton()
                                    .setCustomId(`recommendation_downvote_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setEmoji("955319940435574794")
                                    .setStyle("DANGER");

                                const vote = new MessageButton().
                                    setCustomId(`recommendation_vote_${userid}_${index}_${reclistid}_${currentid}`)
                                    .setLabel("Vote")
                                    .setStyle("PRIMARY");


                                row.setComponents([prior, upvote, downvote, next, vote]);

                                const result: any = await buildRecommendation(recommendation, index, max);

                                await message.edit({ embeds: [result.embed], components: [row], files: [new DataImageAttachment(result.img, "recommendation.png")] });
                                await interaction.deferUpdate();
                                return;
                            }

                            if (index > 0) {

                                index--;

                            }

                            const recommendation: any = await Recommendation.findOne({ _id: reclist.mongoids[index] });
                            currentid = recommendation.id;

                            const row = new MessageActionRow();

                            const next = new MessageButton().
                                setCustomId(`recommendation_next_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("951821813460115527")
                                .setStyle("PRIMARY");

                            const prior = new MessageButton().
                                setCustomId(`recommendation_prior_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("951821813288140840")
                                .setStyle("PRIMARY");

                            const upvote = new MessageButton()
                                .setCustomId(`recommendation_upvote_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("955320158270922772")
                                .setStyle("SUCCESS");

                            const downvote = new MessageButton()
                                .setCustomId(`recommendation_downvote_${userid}_${index}_${reclistid}_${currentid}`)
                                .setEmoji("955319940435574794")
                                .setStyle("DANGER");

                            const vote = new MessageButton().
                                setCustomId(`recommendation_vote_${userid}_${index}_${reclistid}_${currentid}`)
                                .setLabel("Vote")
                                .setStyle("PRIMARY");


                            row.setComponents([prior, upvote, downvote, next, vote]);

                            const result: any = await buildRecommendation(recommendation, index, max);

                            await message.edit({ embeds: [result.embed], components: [row], files: [new DataImageAttachment(result.img, "recommendation.png")] });
                            await interaction.deferUpdate();
                            return;

                        }

                        break;

                    }

                    case "vote": {

                        const message = await categoryvote(currentid, userid, interaction)


                    }
                }

            }

        }

    })
}