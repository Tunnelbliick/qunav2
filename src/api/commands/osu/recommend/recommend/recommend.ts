import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { buildMapEmbed, buildMapEmbedNoResponse } from "../../../../../embeds/osu/beatmap/beatmap";
import { noRecs, queryError } from "../../../../../embeds/osu/recommend/recommend/error";
import { checkIfUserExists } from "../../../../../embeds/utility/nouserfound";
import { QunaUser } from "../../../../../interfaces/QunaUser";
import LastRec from "../../../../../models/LastRec";
import { LastRecObject } from "../../../../../models/LastRecObject";
import Recommendation from "../../../../../models/Recommendation";
import RecommndationList from "../../../../../models/RecommndationList";
import Type from "../../../../../models/Type";
import User from "../../../../../models/User";
import { encrypt } from "../../../../../utility/encrypt";
import { getDifficultyColor } from "../../../../../utility/gradiant";
import { categoriechart } from "../../../../chart.js/recommend/categories";
import { updownvote } from "../../../../chart.js/recommend/upvotes";
import { getBeatmap } from "../../../../osu/beatmap";
import { parseModString } from "../../../../osu/utility/parsemods";
import { buildRecList, buildRecommendByPrycon, buildRecommendByQuery, buildRecommendsBasedOnPriorLikes } from "../../../../recommend/recommend/recommend";
import { filterRecommends, suggestion_filter } from "../../../../recommend/showsuggestions/filter";
import { buildSearch, buildSearchForRequest } from "../../../../utility/buildsearch";

const DataImageAttachment = require("dataimageattachment");
const { ObjectId } = require('mongodb');
const Procyon = require('procyon')
const { createCanvas, loadImage } = require('canvas')

export async function bulldrecommends(message: any, args: any, prefix: any) {

    let type = "top";
    let mode = "osu";

    message.channel.sendTyping();

    const top_osu = new Procyon({
        className: 'osu_top'
    })

    const userObject: QunaUser | null = await User.findOne({ discordid: await encrypt(message.author.id) });

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

    await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })
    return;

}
