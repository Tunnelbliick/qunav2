import asyncBatch from "async-batch";
import axios from "axios";
import { MessageActionRow, MessageButton } from "discord.js";
import { buildMapEmbedMoreLikeThis, buildMapEmbedRecommendation } from "../../../../../embeds/osu/beatmap/beatmap";
import { noRecs, serverOffline, toManyRequests } from "../../../../../embeds/osu/recommend/recommend/error";
import { checkIfUserExists } from "../../../../../embeds/utility/nouserfound";
import { QunaUser } from "../../../../../interfaces/QunaUser";
import RecLike from "../../../../../models/RecLike";
import Recommendation from "../../../../../models/Recommendation";
import RecommendationInfo from "../../../../../models/RecommendationInfo";
import User from "../../../../../models/User";
import UserHash from "../../../../../models/UserHash";
import { encrypt } from "../../../../../utility/encrypt";
import { BeatmapStats, calcualteStatsforMods } from "../../../../beatmaps/stats";
import { getBeatmap } from "../../../../osu/beatmap";
import { getTopForUser } from "../../../../osu/top";
import { parseModRestricted, parseModString } from "../../../../osu/utility/parsemods";
import { loadMapPP } from "../../../../pp/db/loadmap";
import { checkForBeatmap } from "../../../../utility/checkForBeatmap";
import { getMoreLikeThis } from "../../../../../handlers/recommend/moreLikeThis";

const DataImageAttachment = require("dataimageattachment");

export interface Recommendation_data {
    item: string,
    score: string,
}

export async function fixrecommends() {

    console.log('Started fixing recommends');

    const expliciteLikes = await RecLike.find({ origin: "manual_top" });
    const index = 0;
    for (const like of expliciteLikes) {

        if (like.mode === null || like.mode === undefined) {
            like.mode = "osu";
        }

        await like.save();
    }

}

export async function buildSimilar(message: any, args: string[], prefix: any) {

    message.channel.sendTyping();

    const userObject: QunaUser | null = await User.findOne({ discordid: await encrypt(message.author.id) });

    if (userObject === null || userObject === undefined) {
        checkIfUserExists(userObject);
        return;
    }

    const userPromise = UserHash.findOne({ osuid: +userObject.userid });
    const topPromise = getTopForUser(userObject?.userid, undefined, undefined, "osu");

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

    const impliciteLikes = await RecLike.find({ osuid: userHash.osuid, origin: "top" });
    const expliciteLikes = await RecLike.find({ osuid: userHash.osuid, origin: "manual_top" });

    const impliciteLikesValues: string[] = impliciteLikes.map((like: any) => like.value);
    const expliciteLikesValues: string[] = expliciteLikes.map((like: any) => like.value);

    const newImpliciteLikes = top100Values.slice(0, 25).filter(value =>
        !impliciteLikesValues.includes(value) && !expliciteLikesValues.includes(value)
    )

    const removedImpliciteLikes = impliciteLikesValues.filter(value =>
        !top100Values.includes(value) && !expliciteLikesValues.includes(value)
    )

    const newLikes = [];

    for (const value of newImpliciteLikes) {

        const like = new RecLike();
        like.osuid = userHash.osuid;
        like.beatmapid = +value.split("_")[0];
        like.origin = "top";
        like.mode = "osu";
        like.value = value;
        like.vote = "like";

        newLikes.push(like);
    }

    await RecLike.deleteMany({ value: { $in: removedImpliciteLikes }, osuid: userHash.osuid, origin: "top" });
    await RecLike.bulkSave(newLikes);

    if (checkIfUserExists(userObject, message) || userObject == null) {
        return;
    }

    const userid: number = +userObject.userid;
    const max_index = 100;
    const index = 0;
    let count = 1000;

    const map: any = await checkForBeatmap(message, null, args);

    const parsedMods = parseModString(map.mods);
    let mods = parseModRestricted(parsedMods);

    if (mods.includes("NM")) {
        mods = [];
    }

    count = 10000;

    const source = `${map.id}_${mods.join("")}`

    const recommendations = await getMoreLikeThis(userid, source);

    let top10 = recommendations.slice(0, 10);

    let split = top10[0].item.split("_");
    let beatmapid = split[0];

    const beatmap: any = await getBeatmap(beatmapid);

    const value = `${beatmap.id}-${split[1]}`

    const { embed, result } = await buildMapEmbedMoreLikeThis(split[1], beatmap, 0, top10[0].score);

    const row = new MessageActionRow();

    const next = new MessageButton().
        setCustomId(`morelike_next_${message.author.id}_0_${userid}_${source}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`morelike_prior_${message.author.id}_0_${userid}_${source}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`morelike_like_${message.author.id}_0_${userid}_${source}_${value}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`morelike_dislike_${message.author.id}_0_${userid}_${source}_${value}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    const morelike = new MessageButton()
        .setCustomId(`morelike_more_${message.author.id}_0_${userid}_${source}_${value}`)
        .setLabel("More like this")
        .setStyle("PRIMARY");

    row.addComponents([prior, upvote, downvote, next, morelike]);

    await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })

    return;
}

export async function bulldrecommends(message: any, args: string[], prefix: any) {

    message.channel.sendTyping();

    const userObject: QunaUser | null = await User.findOne({ discordid: await encrypt(message.author.id) });

    if (userObject === null || userObject === undefined) {
        checkIfUserExists(userObject);
        return;
    }

    const userPromise = UserHash.findOne({ osuid: +userObject.userid });
    const topPromise = getTopForUser(userObject?.userid, undefined, undefined, "osu");

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

    const impliciteLikes = await RecLike.find({ osuid: userHash.osuid, origin: "top" });
    const expliciteLikes = await RecLike.find({ osuid: userHash.osuid, origin: "manual_top" });

    const impliciteLikesValues: string[] = impliciteLikes.map((like: any) => like.value);
    const expliciteLikesValues: string[] = expliciteLikes.map((like: any) => like.value);

    const newImpliciteLikes = top100Values.slice(0, 25).filter(value =>
        !impliciteLikesValues.includes(value) && !expliciteLikesValues.includes(value)
    )

    const removedImpliciteLikes = impliciteLikesValues.filter(value =>
        !top100Values.includes(value) && !expliciteLikesValues.includes(value)
    )

    const newLikes = [];

    for (const value of newImpliciteLikes) {

        const like = new RecLike();
        like.osuid = userHash.osuid;
        like.beatmapid = +value.split("_")[0];
        like.origin = "top";
        like.mode = "osu";
        like.value = value;
        like.vote = "like";

        newLikes.push(like);
    }

    await RecLike.deleteMany({ value: { $in: removedImpliciteLikes }, osuid: userHash.osuid, origin: "top" });
    await RecLike.bulkSave(newLikes);

    if (checkIfUserExists(userObject, message) || userObject == null) {
        return;
    }

    const userid: number = +userObject.userid;
    let recommendations: Recommendation_data[] = [];
    const max_index = 100;
    const index = 0;
    let count = 1000;
    let mods: Array<String> = [];

    if (args.length != 0) {

        const parsedMods = parseModString(args[0]);
        let mods = parseModRestricted(parsedMods);

        if (mods.includes("NM")) {
            mods = [];
        }

        count = 10000;

        try {
            await axios.get<Recommendation_data[]>(`http://127.0.0.1:8082/recommend/mods/${userid}?count=${count}&mods=${mods.join("")}`).then((resp: any) => {
                recommendations = resp.data;
            })
        } catch (e: any) {

            if (e.code === 'ECONNREFUSED') {
                serverOffline(message);
                return;
            }
        }

    } else {

        try {
            await axios.get<Recommendation_data[]>(`http://127.0.0.1:8082/recommend/${userid}?count=${count}`).then((resp: any) => {
                recommendations = resp.data;
            })
        } catch (e: any) {

            if (e.code === 'ECONNREFUSED') {
                serverOffline(message);
                return;
            }
        }


    }


    let recInfo = await RecommendationInfo.findOne({ osuid: userid })
    const now = new Date(); // create a new Date object

    // If hash is null create new hash
    if (recInfo === undefined || recInfo === null) {
        recInfo = new RecommendationInfo();
        recInfo.osuid = userid;
        recInfo.currentIndex = 0;
        recInfo.createdAt = now;
        recInfo.length = max_index;
        recInfo.mods = mods;

        await recInfo.save();
        await saveRecommends();
    } else {

        if (arraysAreNotEqual(mods, recInfo.mods)) {

            if (isFiveMinutesAgo(recInfo.createdAt)) {

                recInfo.currentIndex = 0;
                recInfo.createdAt = now;
                recInfo.length = max_index;

                await recInfo.save();
                await Recommendation.deleteMany({ osuid: userid });
                await saveRecommends();

            } else {

                toManyRequests(message);
                return;

            }

        }

        if (isAfterLastFullHalfHour(recInfo.createdAt) || recInfo.length === 0) {

            recInfo.currentIndex = 0;
            recInfo.createdAt = now;
            recInfo.length = max_index;

            await recInfo.save();
            await Recommendation.deleteMany({ osuid: userid });
            await saveRecommends();
        }
    }

    // console.log(await top_osu.mostLiked());

    if (recommendations.length == 0) {
        noRecs(message);
        return;
    }

    const rec = await Recommendation.find({ osuid: userid }).sort({ score: -1 }).skip(index).limit(1).exec();

    const beatmap = await getBeatmap(rec[0].mapid);
    const value = `${rec[0].mapid}_${rec[0].mods.join("")}`
    const { embed, result } = await buildMapEmbedRecommendation(rec[0], beatmap, index, recInfo);

    const row = new MessageActionRow();

    const next = new MessageButton().
        setCustomId(`recommendation_next_${message.author.id}_${index}_${userid}`)
        .setEmoji("951821813460115527")
        .setStyle("PRIMARY");

    const prior = new MessageButton().
        setCustomId(`recommendation_prior_${message.author.id}_${index}_${userid}`)
        .setEmoji("951821813288140840")
        .setStyle("PRIMARY");

    const upvote = new MessageButton()
        .setCustomId(`recommendation_like_${message.author.id}_${index}_${userid}_${rec[0].id}`)
        .setEmoji("955320158270922772")
        .setStyle("SUCCESS");

    const downvote = new MessageButton()
        .setCustomId(`recommendation_dislike_${message.author.id}_${index}_${userid}_${rec[0].id}`)
        .setEmoji("955319940435574794")
        .setStyle("DANGER");

    const moreLikeThis = new MessageButton().
        setCustomId(`recommendation_more_${message.author.id}_${index}_${userid}_${rec[0].id}`)
        .setLabel("More like this")
        .setStyle("PRIMARY");

    row.addComponents([prior, upvote, downvote, next, moreLikeThis]);

    await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(result, "chart.png")] })

    return;

    async function saveRecommends() {

        const recommendation_cache: any[] = [];

        await asyncBatch(recommendations.slice(0, max_index),
            (rec: Recommendation_data) => new Promise(
                async (resolve) => {

                    const rec_split = rec.item.split("_");
                    const beatmapid = rec_split[0];
                    const options = rec_split[1];
                    const modArray = parseModRestricted(parseModString(options));

                    const data = await getBeatmap(beatmapid);

                    const recommendation = new Recommendation();

                    let stats: BeatmapStats = {
                        cs: data.cs,
                        hp: data.drain,
                        bpm: data.beatmapset.bpm,
                        mapLength: data.total_length,
                        mapDrain: data.hit_length
                    };

                    const pp_stats = await loadMapPP(data, modArray, 0);

                    const acc100 = pp_stats.pp[100];
                    const acc99 = pp_stats.pp[99];
                    const acc97 = pp_stats.pp[97];
                    const acc95 = pp_stats.pp[95];

                    const difficulty = pp_stats.difficulty;

                    stats = calcualteStatsforMods(stats, modArray);
                    recommendation.osuid = userid;
                    recommendation.mapid = beatmapid;
                    recommendation.title = data.beatmapset.title;
                    recommendation.artist = data.beatmapset.artist;
                    recommendation.version = data.version;
                    recommendation.creator = data.beatmapset.creator;
                    recommendation.mode = data.mode;
                    recommendation.maxCombo = data.max_combo;
                    recommendation.mods = modArray;
                    recommendation.drain = stats.mapDrain;
                    recommendation.length = stats.mapLength;
                    recommendation.ar = difficulty.ar;
                    recommendation.od = difficulty.od;
                    recommendation.cs = difficulty.cs;
                    recommendation.hp = difficulty.hp;
                    recommendation.bpm = stats.bpm;
                    recommendation.star = difficulty.stars;
                    recommendation.acc95 = acc95;
                    recommendation.acc97 = acc97;
                    recommendation.acc99 = acc99;
                    recommendation.acc100 = acc100;
                    recommendation.score = +rec.score;

                    recommendation_cache.push(recommendation);

                    resolve(recommendation);


                }), 10);

        await Recommendation.bulkSave(recommendation_cache);
    }
}

function isAfterLastFullHalfHour(checkTime: Date): boolean {

    const currentTime = new Date();

    // Get the minutes of the current time
    const currentMinutes = currentTime.getMinutes();

    // Calculate the last full half-hour of the current time
    const lastFullHalfHour = currentMinutes >= 30 ? currentTime.setMinutes(30) : currentTime.setMinutes(0);

    // Compare the checkTime with the last full half-hour
    return checkTime.getTime() < lastFullHalfHour;
}

function isFiveMinutesAgo(date: Date): boolean {
    const currentTime: number = new Date().getTime();
    const inputTime: number = date.getTime();
    const fiveMinutesInMilliseconds: number = 5 * 60 * 1000;

    return Math.abs(currentTime - inputTime) >= fiveMinutesInMilliseconds;
}

function arraysAreNotEqual<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) {
        return true;
    }

    return arr1.some((value, index) => value !== arr2[index]);
}
