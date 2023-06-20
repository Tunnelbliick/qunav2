import { EmbedBuilder } from "discord.js";
import { BeatmapStats, calcualteStatsforMods } from "../api/utility/stats";
import { RecentScore } from "../api/osu/recent/recent";
import { replaceFirstDots } from "../api/utility/comma";
import { getDifficultyColor } from "../api/utility/gradiant";
import { stdCompact, stdFields } from "./mode/osu";
import { maniaCompact, maniaFields } from "./mode/mania";
import { taikoCompact, taikoFields } from "./mode/taiko";
import { ctbCompact, ctbFields } from "./mode/ctb";

export interface RecentEmbedParameters {
    progress: string,
    appliedmods: string,
    total_objects: number,
    stats: BeatmapStats,
    score: RecentScore
}

export function generateRecentEmbed(score: RecentScore, stored?: boolean) {

    const user = score.user!;
    const map = score.beatmap!;
    const play = score.score!;
    const best = score.best;
    const leaderboard = score.leaderboard;
    const difficulty = score.performance?.difficulty!;
    const color = getDifficultyColor(difficulty.star);
    const total_objects = map.count_circles + map.count_sliders + map.count_spinners;

    // Map stats
    let stats: BeatmapStats = {
        cs: map.cs,
        hp: map.drain,
        bpm: map.beatmapset.bpm,
        mapLength: map.total_length,
        mapDrain: map.hit_length
    }

    // User stats
    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    const mods: string[] = play.mods;
    let appliedmods: string = "+";
    mods.forEach(m => { appliedmods += m });

    let progressString: string = "";

    if (play.rank == "F") {
        const progress = 100 / (map.count_circles + map.count_sliders + map.count_spinners) * (play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss);
        progressString = `(${replaceFirstDots(progress.toFixed(2))}%)`;
    }

    stats = calcualteStatsforMods(stats, mods);

    const param: RecentEmbedParameters = {
        progress: progressString,
        appliedmods: appliedmods,
        stats: stats,
        total_objects: total_objects,
        score: score
    }

    let fullsize = new EmbedBuilder()
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
        .setColor(color)
        .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
        .setURL(`${map.url}`)
        .setImage(`${map.beatmapset.covers.cover}`) // the @2x version does not work sadge
        .setFooter({ text: `${map.status} by ${map.beatmapset.creator} ${stored === true ? "| Unranked score saved!" : ""}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

    let description: string = "";

    if (leaderboard !== undefined && leaderboard.index !== undefined && leaderboard.type !== undefined) {
        description += `**Global Top #${leaderboard.index + 1}** `;
    }

    if (best !== undefined && best.index !== undefined && best.type !== undefined) {
        description += `**Personal Best #${best.index + 1}**`;
    }

    if (description !== "") {
        fullsize.setDescription(description);
    }

    switch (play.mode) {
        case "osu":
            fullsize = stdFields(param, fullsize);
            break;
        case "mania":
            fullsize = maniaFields(param, fullsize);
            break;
        case "taiko":
            fullsize = taikoFields(param, fullsize);
            break;
        case "fruits":
            fullsize = ctbFields(param, fullsize);
            break;
    }

    return fullsize;

}

export function generateRecentEmbedCompact(score: RecentScore, stored?: boolean) {

    const user = score.user!;
    const map = score.beatmap!;
    const play = score.score!;
    const best = score.best;
    const leaderboard = score.leaderboard;
    const difficulty = score.performance?.difficulty!;
    const color = getDifficultyColor(difficulty.star);
    const total_objects = map.count_circles + map.count_sliders + map.count_spinners;

    // Map stats
    let stats: BeatmapStats = {
        cs: map.cs,
        hp: map.drain,
        bpm: map.beatmapset.bpm,
        mapLength: map.total_length,
        mapDrain: map.hit_length
    }

    // User stats
    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    const mods: string[] = play.mods;
    let appliedmods: string = "+";
    mods.forEach(m => { appliedmods += m });

    let progressString: string = "";

    if (play.rank == "F") {
        const progress = 100 / (map.count_circles + map.count_sliders + map.count_spinners) * (play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss);
        progressString = `(${replaceFirstDots(progress.toFixed(2))}%)`;
    }

    stats = calcualteStatsforMods(stats, mods);

    const param: RecentEmbedParameters = {
        progress: progressString,
        appliedmods: appliedmods,
        stats: stats,
        total_objects: total_objects,
        score: score
    }

    let compact = new EmbedBuilder()
        .setThumbnail(`${map.beatmapset.covers.list}`)
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
        .setColor(color)
        .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
        .setURL(`${map.url}`)
        .setFooter({ text: `${map.status} by ${map.beatmapset.creator} ${stored === true ? "| Unranked score saved!" : ""}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

    let description: string = "";

    if (leaderboard !== undefined && leaderboard.index !== undefined && leaderboard.type !== undefined) {
        description += `**Global Top #${leaderboard.index + 1}** `;
    }

    if (best !== undefined && best.index !== undefined && best.type !== undefined) {
        description += `**Personal Best #${best.index + 1}**`;
    }

    if (description !== "") {
        compact.setDescription(description);
    }

    switch (play.mode) {
        case "osu":
            compact = stdCompact(param, compact);
            break;
        case "mania":
            compact = maniaCompact(param, compact);
            break;
        case "taiko":
            compact = taikoCompact(param, compact);
            break;
        case "fruits":
            compact = ctbCompact(param, compact);
            break;
    }

    return compact;
}