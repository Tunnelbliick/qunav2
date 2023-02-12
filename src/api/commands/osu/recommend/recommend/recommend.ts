import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { buildMapEmbed, buildMapEmbedNoResponse } from "../../../../../embeds/osu/beatmap/beatmap";
import { noRecs, queryError } from "../../../../../embeds/osu/recommend/recommend/error";
import { checkIfUserExists } from "../../../../../embeds/utility/nouserfound";
import { QunaUser } from "../../../../../interfaces/QunaUser";
import RecLike from "../../../../../models/RecLike";
import User from "../../../../../models/User";
import UserHash from "../../../../../models/UserHash";
import { encrypt } from "../../../../../utility/encrypt";
import { getBeatmap } from "../../../../osu/beatmap";
import { getTopForUser } from "../../../../osu/top";
const hash = require("hash-sum")

const DataImageAttachment = require("dataimageattachment");
const { ObjectId } = require('mongodb');
const Procyon = require('procyon')
const { createCanvas, loadImage } = require('canvas')

export async function bulldrecommends(message: any, args: any, prefix: any) {

    let type = "top";
    let mode = "osu";
    let reply = undefined;

    message.channel.sendTyping();

    const top_osu = new Procyon({
        className: 'top_osu'
    })

    const userObject: QunaUser | null = await User.findOne({ discordid: await encrypt(message.author.id) });

    if (userObject === null || userObject === undefined) {
        checkIfUserExists(userObject);
        return;
    }

    let userPromise = UserHash.findOne({ osuid: +userObject.userid });
    let topPromise = getTopForUser(userObject?.userid, undefined, undefined, "osu");

    let userHash: any;
    let top100: any;

    await Promise.all([userPromise, topPromise]).then((result: any) => {
        userHash = result[0];
        top100 = result[1];
    })

    const top100Values: string[] = top100.map((top: any) => {
        const play = top.value;

        return `${play.beatmap.id}_${play.mods.join("")}`
    })

    if ((userHash !== null || userHash !== undefined) && userHash.updating) {
        const errorEmbed = new MessageEmbed()
            .setColor(0x737df9)
            .setTitle(`Recalculating`)
            .setDescription(`Your Recommendations are beeing recalculated.\nPlease wait a moment.`)

        await message.reply({ embeds: [errorEmbed] });
        return;
    }

    const topHash = hash(JSON.stringify(top100Values));

    if (userHash.topHash !== topHash || userHash.topHash === undefined || userHash.topHash === null) {

        const errorEmbed = new MessageEmbed()
            .setColor(0x737df9)
            .setTitle(`Recalculating`)
            .setDescription(`Your Recommendations are beeing recalculated.\nPlease wait a moment.`)

        reply = await message.reply({ embeds: [errorEmbed] });

        // If hash is null create new hash
        if (userHash === undefined || userHash === null) {
            userHash = new UserHash();
            userHash.osuid = +userObject.userid;
        }

        // Set state to updating
        userHash.updating = true;

        // Push back to db and create new if missing
        await UserHash.updateOne({ osuid: userHash.osuid }, userHash, { upsert: true });

        const impliciteLikes = await RecLike.find({ osuid: userHash.osuid, origin: "top" });
        const expliciteLikes = await RecLike.find({ osuid: userHash.osuid, origin: "manual_top" });

        const impliciteLikesValues: string[] = impliciteLikes.map((like: any) => like.value);
        const expliciteLikesValues: string[] = expliciteLikes.map((like: any) => like.value);

        const newImpliciteLikes = top100Values.filter(value =>
            !impliciteLikesValues.includes(value) && !expliciteLikesValues.includes(value)
        )

        const removedImpliciteLikes = impliciteLikesValues.filter(value =>
            !top100Values.includes(value) && !expliciteLikesValues.includes(value)
        )

        for (let value of removedImpliciteLikes) {
            await top_osu.unliked(userHash.osuid, value);
        }

        let newLikes = [];

        for (let value of newImpliciteLikes) {

            const like = new RecLike();
            like.osuid = userHash.osuid;
            like.beatmapid = +value.split("_")[0];
            like.origin = "top";
            like.mode = "osu";
            like.value = value;
            like.type = "like";

            newLikes.push(like);

            await top_osu.liked(userHash.osuid, value);
        }

        await RecLike.deleteMany({ value: { $in: removedImpliciteLikes }, osuid: userHash.osuid, origin: "top" });
        await RecLike.bulkSave(newLikes);

        // Were done updating set the new topHash
        userHash.updating = false;
        userHash.topHash = topHash;

        // Save back to db
        await UserHash.updateOne({ osuid: userHash.osuid }, userHash, { upsert: true });

    }

    if (checkIfUserExists(userObject, message) || userObject == null) {
        return;
    }

    const userid: number = +userObject.userid;
    let recommendations: string[] = [];
    let max_index = 0;
    let index = 0;

    recommendations = await top_osu.recommendFor(userid, 1);

    // console.log(await top_osu.mostLiked());

    if (recommendations.length == 0) {
        noRecs(message);
        return;
    }

    max_index = recommendations.length;
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
        setCustomId(`recommendation_next_${message.author.id}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`recommendation_prior_${message.author.id}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`recommendation_like_${message.author.id}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`recommendation_dislike_${message.author.id}_${index}_${userid}_${rec}_${mode}_${type}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    row.addComponents([prior, upvote, downvote, next]);

    if (reply) {
        await reply.edit({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] });
    } else {
        await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
    }

    return;

}
