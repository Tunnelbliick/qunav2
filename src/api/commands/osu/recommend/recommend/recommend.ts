import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { noRecs, queryError } from "../../../../../embeds/osu/recommend/recommend/error";
import { checkIfUserExists } from "../../../../../embeds/utility/nouserfound";
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
import { buildRecList, buildRecommendByPrycon, buildRecommendByQuery, buildRecommendsBasedOnPriorLikes } from "../../../../recommend/recommend/recommend";
import { filterRecommends, suggestion_filter } from "../../../../recommend/showsuggestions/filter";
import { buildSearch, buildSearchForRequest } from "../../../../utility/buildsearch";

const DataImageAttachment = require("dataimageattachment");
const { ObjectId } = require('mongodb');
const Procyon = require('procyon')
const { createCanvas, loadImage } = require('canvas')

export async function bulldrecommends(message: any, args: any, prefix: any) {

    message.channel.sendTyping();

    let procyon: any = new Procyon({
        className: 'maps'
    });

    const userObject: any = await User.findOne({ discordid: await encrypt(message.author.id) });
    const typeObject: any = await Type.find();
    const userid: any = userObject.userid;
    let mods: any = [];
    let categoriestring = "";
    const typeArray: any = [];
    let recommendations: any;
    const index = 0;
    let max_index = 0;
    let recList: any;

    for (const type of typeObject) {
        typeArray.push(type.name);
    }

    if (checkIfUserExists(userObject, message)) {
        return;
    }


    if (!args[0]) {

        recommendations = await procyon.recommendFor(userid, 5);

        if (recommendations == undefined || recommendations.length == 0) {
            recommendations = await buildRecommendsBasedOnPriorLikes(userid);
            recList = await buildRecList(recommendations, userid);
        } else {
            recommendations = await buildRecommendByPrycon(recommendations);
            recList = await buildRecList(recommendations, userid);
        }

        if (recommendations == null) {
            noRecs(message);
            return;
        }

    } else {

        recommendations = await buildRecommendByQuery(message, args);
        recList = await buildRecList(recommendations, userid);

    }


    max_index = recommendations.length;
    const recommendation = recommendations.slice(index, 1)[0];

    if (recommendation == null) {
        noRecs(message);
        return;
    }

    const embedColor = getDifficultyColor(recommendation.star);

    if (recommendation.mods != undefined)
        mods = recommendation.mods;
    let bpm = recommendation.bpm;

    let mapLength = recommendation.length // map length
    let mapDrain = recommendation.drain // drain time

    if (mods.includes("DT") || mods.includes("NC")) {
        bpm = bpm * 1.5;
        mapLength = mapLength / 1.5
        mapDrain = mapDrain / 1.5
    }

    const min = Math.floor(mapLength / 60)
    const sec = Math.floor(mapLength - min * 60)
    let strSec = sec.toFixed(0).toString()

    if (sec < 10) { strSec = "0" + sec }

    const dmin = Math.floor(mapDrain / 60)
    const dsec = Math.floor(mapDrain - dmin * 60)
    let strDSec = sec.toFixed(0).toString()

    if (dsec < 10) { strDSec = "0" + dsec }

    let mString = "";

    for (const m of mods) {
        mString += `\`${m}\` `;
    }

    if (mString == "") {
        mString = `\`NM\``;
    }

    for (const t of recommendation.type) {
        categoriestring += `\`${t.category}\` `;
    }

    const upvotedownvoteChart = await updownvote(recommendation);
    const typesChart = await categoriechart(recommendation);

    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')

    const upvoteDownvote = await loadImage(upvotedownvoteChart);
    const types = await loadImage(typesChart);

    ctx.drawImage(upvoteDownvote, 0, 0); // Or at whatever offset you like
    ctx.drawImage(types, canvas.width - types.width, 0);

    const canvasBase = canvas.toDataURL();

    const row = new MessageActionRow();

    const next = new MessageButton().
        setCustomId(`recommendation_next_${userid}_${index}_${recList.id}_${recommendation.id}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`recommendation_prior_${userid}_${index}_${recList.id}_${recommendation.id}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`recommendation_upvote_${userid}_${index}_${recList.id}_${recommendation.id}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`recommendation_downvote_${userid}_${index}_${recList.id}_${recommendation.id}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    const vote = new MessageButton().
    setCustomId(`recommendation_vote_${userid}_${index}_${recList.id}_${recommendation.id}`)
    .setLabel("Vote")
    .setStyle("PRIMARY");


    row.setComponents([prior, upvote, downvote, next, vote]);

    const recommendationembed = new MessageEmbed()
        .setAuthor({ name: `Personal beatmap recommendation (${index + 1}/${max_index})` })
        .setColor(embedColor)
        .setTitle(`${recommendation.artist} - ${recommendation.title} [${recommendation.version}]`)
        .setImage("attachment://recommendation.png")
        .setDescription(`Length: \`${min}:${strSec}\` (\`${dmin}:${strDSec}\`) BPM: \`${bpm}\` Objects: \`${recommendation.circles + recommendation.sliders + recommendation.spinners}\`\n` +
            `CS:\`${recommendation.cs}\` AR:\`${recommendation.ar}\` OD:\`${recommendation.od}\` HP:\`${recommendation.hp}\` Stars: \`${recommendation.star}★\``)
        .setFields([{
            name: `Mods`,
            value: mString,
            inline: false
        }, {
            name: `Categories`,
            value: categoriestring,
            inline: false,
        }])
        .setURL(`https://osu.ppy.sh/beatmaps/${recommendation.mapid}`)

    await message.reply({ embeds: [recommendationembed], components: [row], files: [new DataImageAttachment(canvasBase, "recommendation.png")] });

}
