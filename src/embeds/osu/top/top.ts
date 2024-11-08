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
import { modeIntToMode } from "../../../api/osu/utility/utility";
import { buildModString, buildScoreString, buildStatisticString } from "../../../utility/score";

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

    const min = index * 5;

    const currentlyDisplayed = data.slice(min, min + 5);

    const plays: Array<any> = [];

    const promises = []
    for (const item of currentlyDisplayed) {
        promises.push(getMaxForCurrentTopArray(item));
    }

    const playsPromiseList: any = await Promise.all(promises).catch(error => {
        console.error("Page still processing, retry in 10 seconds");
        return;
    })

    playsPromiseList.forEach((score: any) => {
        plays.push(score);
    })

    if (plays.length != 1) {
        plays.forEach((play: any) => {
            const field = genereateField(play);
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


        const score = plays[0].value;
        const beatmap = plays[0].beatmap.value;
        const maxpp = plays[0].maxpp.value.pp[100];
        const diff = await difficulty(beatmap.id, beatmap.checksum, score.ruleset_id, score.mods);
        const leaderboard = await getLeaderBoardPosition(beatmap.id, modeIntToMode(score.ruleset_id), score.id);

        if (score == null || beatmap == null || maxpp == null) {
            return null;
        }

        let appliedmods: any = buildModString(score);

        // @ts-ignore 
        const rankEmote: any = rank_icons[score.rank];

        let stats: BeatmapStats = {
            cs: beatmap.cs,
            hp: beatmap.drain,
            bpm: beatmap.beatmapset.bpm,
            mapLength: beatmap.total_length,
            mapDrain: beatmap.hit_length
        }

        stats = calcualteStatsforMods(stats, score.mods);

        const total_object = beatmap.count_circles + beatmap.count_sliders + beatmap.count_spinners;

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

        const param: TopEmbedParameters = {
            play: score,
            rank: rankEmote,
            appliedmods: appliedmods,
            acc100: maxpp,
            total_objects: total_object,
            difficulty: diff,
            stats: stats,
            max_combo: beatmap.max_combo,
        }


        switch (modeIntToMode(score.ruleset_id)) {
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

    const score = play.value;
    const beatmap = play.beatmap.value;
    const maxpp = play.maxpp.value.pp[100];
    const difficulty = play.difficulty.value;

    if (score == null || beatmap == null || maxpp == null) {
        return null;
    }

    const currentTimeInSeconds = Math.floor(new Date(score.ended_at).getTime() / 1000)

    let appliedmods: any = buildModString(score);

    // @ts-ignore 
    const rankEmote: any = rank_icons[score.rank];

    let scoreField = ""

    switch (modeIntToMode(score.ruleset_id)) {
        case "osu":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.stars.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${buildScoreString(score)}\n` +
                `[**${score.max_combo}x**/${difficulty.max_combo}x] ` +
                `${buildStatisticString(score)}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
        case "mania":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.stars.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${buildScoreString(score)}\n` +
                `[**${score.max_combo}x**] ` +
                `${buildStatisticString(score)}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
        case "taiko":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.stars.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${buildScoreString(score)}\n` +
                `[**${score.max_combo}x**/${difficulty.max_combo}x] ` +
                `${buildStatisticString(score)}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
        case "fruits":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.stars.toFixed(2)}★]\n` +
                `${rankEmote} **${score.pp.toFixed(2)}**/${maxpp.toFixed(2)}pp | ${(score.accuracy * 100).toFixed(2)}% | ${buildScoreString(score)}\n` +
                `[**${score.max_combo}x**/${difficulty.max_combo}x] ` +
                `${buildStatisticString(score)}\n ` +
                `Score set <t:${currentTimeInSeconds}:R>\n`
            break;
    }
    return scoreField;


}
