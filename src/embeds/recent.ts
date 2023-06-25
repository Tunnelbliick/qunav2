import { EmbedBuilder } from "discord.js";
import { BeatmapStats, calcualteStatsforMods } from "../api/utility/stats";
import { RecentScore } from "../api/osu/recent/recentHandler";
import { replaceFirstDots } from "../api/utility/comma";
import { getDifficultyColor } from "../api/utility/gradiant";
import { stdCompact, stdFields } from "./mode/osu";
import { maniaCompact, maniaFields } from "./mode/mania";
import { taikoCompact, taikoFields } from "./mode/taiko";
import { ctbCompact, ctbFields } from "./mode/ctb";
import { Server } from "../interfaces/enum/server";
import { capitalize } from "../utility/capitilize";

export interface RecentEmbedParameters {
    progress: string,
    appliedmods: string,
    total_objects: number,
    stats: BeatmapStats,
    score: RecentScore
}

export function generateRecentEmbed(score: RecentScore, stored?: boolean) {

    const server = score.server!;
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
        bpm: map.beatmapset.bpm == undefined ? 0 : map.beatmapset.bpm,
        mapLength: map.total_length,
        mapDrain: map.hit_length
    }

    // User stats
    let global_rank = user.statistics === undefined ? 0 : user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics === undefined ? 0 : user.statistics.rank.country;
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

    let profileurl = "";
    let description: string = "";
    let serverDescription = "";

    switch (server) {
        case Server.AKATSUKI:
            profileurl = `https://akatsuki.gg/u/${user.id}?mode=${play.mode_int}&rx=0`;
            description = "**Set on Akatsuki**";
            serverDescription = "Set on Akatsuki";
            break;
        default:
            profileurl = `https://osu.ppy.sh/u/${user.id}`;
            serverDescription = "Set on Bancho"
            break;
    }

    let fullsize = new EmbedBuilder()
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: profileurl })
        .setColor(color)
        .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
        .setURL(`${map.url}`)
        .setImage(`${map.beatmapset.covers.cover}`) // the @2x version does not work sadge
        .setFooter({ text: `${capitalize(map.status)} by ${map.beatmapset.creator} ${stored === true ? "| Unranked score saved! " : ""}| ${serverDescription}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

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

    const server = score.server!;
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

    let profileurl: string = "";
    let description: string = "";
    let serverDescription: string = "";

    switch (server) {
        case Server.AKATSUKI:
            profileurl = `https://akatsuki.gg/u/${user.id}?mode=${play.mode_int}&rx=0`;
            description = "**Set on Akatsuki**";
            serverDescription = "Set on Akatsuki"
            break;
        default:
            profileurl = `https://osu.ppy.sh/u/${user.id}`;
            serverDescription = "Set on Bancho"
            break;
    }

    let compact = new EmbedBuilder()
        .setThumbnail(`${map.beatmapset.covers.list}`)
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: profileurl })
        .setColor(color)
        .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
        .setURL(`${map.url}`)
        .setFooter({ text: `${capitalize(map.status)} by ${map.beatmapset.creator} ${stored === true ? "| Unranked score saved! " : ""}| ${serverDescription}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

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