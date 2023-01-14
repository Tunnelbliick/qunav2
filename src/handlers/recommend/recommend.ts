import { Client, Message } from "discord.js";
import { getBeatmap } from "../../api/osu/beatmap";
import { buildMapEmbedNoResponse } from "../../embeds/osu/beatmap/beatmap";
import { like } from "../../interfaces/Like";
import RecLike from "../../models/RecLike";
const DataImageAttachment = require("dataimageattachment");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const Procyon = require('procyon')

export default (client: Client) => {

    const procyon: any = new Procyon({
        className: 'top_osu'
    });

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
                const value = `${para[5]}_${para.length === 6 ? '' : para[6]}`;
                const mode = para[7];
                const type = para[8];

                if (mode === undefined || mode === null) {
                    await interaction.deferReply({
                        ephemeral: true
                    });

                    const embed = new MessageEmbed()
                        .setColor(0x737df9)
                        .setTitle(`Outdated`)
                        .setDescription(`Please request a new Recommendation with \`!rec\``);

                    await interaction.editReply({ embeds: [embed] });
                    return;
                }

                switch (method) {
                    case "like": {

                        await interaction.deferReply({
                            ephemeral: true
                        });

                        let like: like = new RecLike();
                        like.beatmapid = para[5];
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.type = "like";
                        like.osuid = userid;
                        like.value = value;

                        const engine = procyon.liked(userid, value);
                        const database = RecLike.updateOne({ value: value, osuid: userid }, like, { upsert: true });

                        await Promise.allSettled([engine, database]);

                        const rec = await procyon.recommendIndexFor(userid, index, 0);

                        buildEmbed(message, rec, index, userid, discordid, mode, type);

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

                        let like: like = new RecLike();
                        like.beatmapid = para[5];
                        like.mode = mode;
                        like.origin = "manual_top";
                        like.type = "dislike";
                        like.osuid = userid;
                        like.value = value;

                        const engine = procyon.disliked(userid, value);
                        const database = RecLike.updateOne({ value: value, osuid: userid }, like, { upsert: true });

                        await Promise.allSettled([engine, database]);

                        const rec = await procyon.recommendIndexFor(userid, index, 0);

                        buildEmbed(message, rec, index, userid, discordid, mode, type);

                        const downvote = new MessageEmbed()
                            .setColor(0x737df9)
                            .setTitle(`Successfully disliked Beatmap`)
                            .setDescription(`You have disliked this beatmap.`)

                        await interaction.editReply({ embeds: [downvote] });
                        return;

                    }

                    case "next": {

                        index++;

                        const rec = await procyon.recommendIndexFor(userid, index, 0);

                        buildEmbed(message, rec, index, userid, discordid, mode, type);
                        await interaction.deferUpdate();
                        return;
                        break;

                    }


                    case "prior": {

                        if (index > 0) {
                            index--;
                        }

                        const rec = await procyon.recommendIndexFor(userid, index, 0);

                        buildEmbed(message, rec, index, userid, discordid, mode, type);
                        await interaction.deferUpdate();
                        return;


                        break;

                    }

                }

            }

        }

    })
}

async function buildEmbed(message: any, recommendations: any, index: number, userid: any, discordid: any, mode: any, type: any) {

    if (recommendations.length == 0) {
        const errorEmbed = new MessageEmbed()
            .setColor(0x737df9)
            .setTitle(`No recommendations`)
            .setDescription(`Quna currently has no personal recommendations for you.\nUse a filter to find normal maps`)
        await message.edit({ embeds: [errorEmbed] })
    }

    const rec = recommendations[0];
    const rec_split = rec.split("_");
    const beatmapid = rec_split[0];
    const options = rec_split[1];
    let mods: string = "";

    if (options == "set") {
        return;
    } else {
        mods = options;
    }

    const data = await getBeatmap(beatmapid)
    const { embed, result } = await buildMapEmbedNoResponse(options, data);

    const row = new MessageActionRow();

    const next = new MessageButton().
        setCustomId(`recommendation_next_${discordid}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`recommendation_prior_${discordid}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`recommendation_like_${discordid}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`recommendation_dislike_${discordid}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    row.addComponents([prior, upvote, downvote, next]);

    await message.edit({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
}