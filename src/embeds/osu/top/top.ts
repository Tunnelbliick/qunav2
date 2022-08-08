import { MessageEmbed } from "discord.js";
import { BeatmapStats, calcualteStatsforMods } from "../../../api/beatmaps/stats";
import { getLeaderBoardPosition } from "../../../api/osu/leaderboard";
import { getMaxForCurrentTopArray } from "../../../api/osu/top";
import { difficulty } from "../../../api/pp/difficulty";
import { replaceFirstDots } from "../../../utility/comma";
import { rank_icons } from "../../../utility/icons";
import { ctbFields } from "./mode/ctb";
import { maniaFields } from "./mode/mania";
import { stdFields } from "./mode/osu";
import { taikoFields } from "./mode/taiko";

export interface TopEmbedParameters {
    play: any,
    rank: any,
    appliedmods: any,
    acc100: any,
    total_objects: any,
    stats: BeatmapStats,
    difficulty: any,
    max_combo: any,
}

export async function topEmbed(data: any, user: any, index: number, max: number) {

    let fields = "";

    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    let min = index * 5;

    let currentlyDisplayed = data.slice(min, min + 5);

    let plays: Array<any> = [];

    let promises = []
    for (let item of currentlyDisplayed) {
        promises.push(getMaxForCurrentTopArray(item));
    }

    let playsPromiseList: any = await Promise.all(promises).catch(error => {
        console.error("Page still processing, retry in 10 seconds");
        return;
    })

    playsPromiseList.forEach((score: any) => {
        plays.push(score);
    })

    console.log(plays.length)

    if (plays.length != 1) {
        plays.forEach((play: any) => {
            let field = genereateField(play);
            if (field != null)
                fields += field;
        })

        const compact = new MessageEmbed()
            .setThumbnail(`${user.avatar_url}`)
            .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
            .setColor("#4b67ba")
            .setDescription(fields)
            .setImage("attachment://chart.png")
            .setFooter({ text: `Page ${index + 1}/${max}` })

        return compact;
    } else {


        let score = plays[0].value;
        let beatmap = plays[0].beatmap.value;
        let maxpp = plays[0].maxpp.value.pp[100];
        let diff = await difficulty(beatmap.id, beatmap.checksum, score.mode, score.mods);
        let leaderboard = await getLeaderBoardPosition(beatmap.id, score.mode, score.id);

        if (score == null || beatmap == null || maxpp == null) {
            return null;
        }

        let mods: Array<String> = score.mods;
        let appliedmods: any = "+";
        mods.forEach(m => { appliedmods += m });

        // @ts-ignore 
        let rankEmote: any = rank_icons[score.rank];

        let stats: BeatmapStats = {
            cs: beatmap.cs,
            hp: beatmap.drain,
            bpm: beatmap.beatmapset.bpm,
            mapLength: beatmap.total_length,
            mapDrain: beatmap.hit_length
        }

        stats = calcualteStatsforMods(stats, score.mods);

        let total_object = beatmap.count_circles + beatmap.count_sliders + beatmap.count_spinners;

        const fullsize = new MessageEmbed()
            .setThumbnail(`${user.avatar_url}`)
            .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
            .setColor("#4b67ba")
            .setTitle(`${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`)
            .setURL(`${beatmap.url}`)
            .setImage(`${beatmap.beatmapset.covers.cover}`) // the @2x version does not work sadge

        let description: any = "";

        if (leaderboard !== undefined) {
            description += `**Global Top #${leaderboard + 1}** `;
        }

        description += `**Personal Best #${plays[0].position + 1}**`;

        if (description !== "") {
            fullsize.setDescription(description);
        }

        let param: TopEmbedParameters = {
            play: score,
            rank: rankEmote,
            appliedmods: appliedmods,
            acc100: maxpp,
            total_objects: total_object,
            difficulty: diff,
            stats: stats,
            max_combo: beatmap.max_combo,
        }


        switch (score.mode) {
            case "osu":
                stdFields(param, fullsize);
                break;
            case "mania":
                maniaFields(param, fullsize);
                break;
            case "taiko":
                taikoFields(param, fullsize);
                break;
            case "fruits":
                ctbFields(param, fullsize);
                break;
        }

        return fullsize;
    }
}

function genereateField(play: any) {

    let score = play.value;
    let beatmap = play.beatmap.value;
    let maxpp = play.maxpp.value.pp[100];
    let difficulty = play.difficulty.value;

    if (score == null || beatmap == null || maxpp == null) {
        return null;
    }

    var currentTimeInSeconds = Math.floor(new Date(score.created_at).getTime() / 1000)

    let mods: Array<String> = score.mods;
    let appliedmods: any = "+";
    mods.forEach(m => { appliedmods += m });

    // @ts-ignore 
    let rankEmote: any = rank_icons[score.rank];

    let scoreField = ""

    switch (score.mode) {
        case "osu":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.star.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${score.score.toLocaleString()}\n` +
                `[**${score.max_combo}x**/${difficulty.max_combo}x] ` +
                `{${score.statistics.count_300}/${score.statistics.count_100}/${score.statistics.count_50}/${score.statistics.count_miss}}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
        case "mania":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.star.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${score.score.toLocaleString()}\n` +
                `[**${score.max_combo}x**] ` +
                `{${score.statistics.count_geki}/${score.statistics.count_300}/${score.statistics.count_katu}/${score.statistics.count_100}/${score.statistics.count_50}/${score.statistics.count_miss}}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
        case "taiko":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.star.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${score.score.toLocaleString()}\n` +
                `[**${score.max_combo}x**/${difficulty.max_combo}x] ` +
                `{${score.statistics.count_300}/${score.statistics.count_100}/${score.statistics.count_miss}}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
        case "fruits":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.star.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${score.score.toLocaleString()}\n` +
                `[**${score.max_combo}x**/${difficulty.max_combo}x] ` +
                `{${score.statistics.count_300}/${score.statistics.count_100}/${score.statistics.count_50}/${score.statistics.count_miss}}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
    }
    return scoreField;


}
