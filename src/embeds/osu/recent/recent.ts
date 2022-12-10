import { Message, MessageEmbed } from "discord.js";
import { BeatmapStats, calcualteStatsforMods } from "../../../api/beatmaps/stats";
import { replaceDots, replaceFirstDots } from "../../../utility/comma";
import { getDifficultyColor } from "../../../utility/gradiant";
import { rank_icons } from "../../../utility/icons";
import { buildAPIErrEmbed } from "../profile/error";
import { ctbFields } from "./mode/ctb";
import { maniaFields } from "./mode/mania";
import { stdFields } from "./mode/osu";
import { taikoFields } from "./mode/taiko";

export interface RecentEmbedParameters {
    play: any,
    rank: any,
    progress: any,
    appliedmods: any,
    ppofplay: any,
    acc100: any,
    ppiffc: any,
    fc_acc: any,
    total_objects: any,
    stats: BeatmapStats,
    difficulty: any,
    max_combo: any,
}

export function generateRecentEmbed(result: any, interaction: any, message: Message, stored?: boolean) {

    if (result == null) {
        if (interaction) {
            interaction.reply("No recent play found");
        } else {
            message.reply("No recent play found");
        }
        return;
    } else if (result == "osuapierr") {
        buildAPIErrEmbed(message);
        return;
    }

    const receipient = interaction;

    const retries = result.retries;
    const user = result.user;
    const map = result.beatmap;
    const play = result.recentplay;
    const acc100 = result.acc100.pp[100];
    const ppIffc = result.ppIffc;
    const top100 = result.top100;
    const leaderboard = result.leaderboard;
    let ppOfPlay = play.pp;
    if (result.hasOwnProperty('ppOfPlay')) {
        ppOfPlay = result.ppOfPlay;
    }
    const rank: any = play.rank;

    // User stats
    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    // Play data
    // @ts-ignore 
    const rankEmote: any = rank_icons[rank];

    const mods: Array<string> = play.mods;
    let appliedmods: any = "+";
    mods.forEach(m => { appliedmods += m });

    let progressString: any = "";

    if (play.rank == "F") {
        const progress = 100 / (map.count_circles + map.count_sliders + map.count_spinners) * (play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss);
        progressString = `(${replaceFirstDots(progress.toFixed(2))}%)`;
    }

    // Map stats

    let stats: BeatmapStats = {
        cs: map.cs,
        hp: map.drain,
        bpm: map.beatmapset.bpm,
        mapLength: map.total_length,
        mapDrain: map.hit_length
    }

    const difficulty = result.difficulty;

    const color = getDifficultyColor(difficulty.star.toFixed(2));

    stats = calcualteStatsforMods(stats, mods);

    const total_object = map.count_circles + map.count_sliders + map.count_spinners;

    let fc_acc = 100;

    switch (play.mode) {
        case "osu":
            fc_acc = (100 * (6 * (total_object - play.statistics.count_100 - play.statistics.count_50) + 2 * play.statistics.count_100 + play.statistics.count_50) / (6 * total_object));
            break;
        case "mania":
            break;
        case "taiko":
            fc_acc = 100 * ((2 * (play.statistics.count_300 + play.statistics.count_miss) + play.statistics.count_100) / (2 * (play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_miss)))
            break;
        case "fruits":
            fc_acc = 100 * ((play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50) / (play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_katu))
            break;
    }

    const param: RecentEmbedParameters = {
        play: play,
        rank: rankEmote,
        progress: progressString,
        appliedmods: appliedmods,
        ppofplay: ppOfPlay,
        ppiffc: ppIffc,
        acc100: acc100,
        fc_acc: fc_acc,
        total_objects: total_object,
        difficulty: difficulty,
        stats: stats,
        max_combo: map.max_combo,
    }

    let fullsize = new MessageEmbed()
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
        .setColor(color)
        .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
        .setURL(`${map.url}`)
        .setImage(`${map.beatmapset.covers.cover}`) // the @2x version does not work sadge
        .setFooter({ text: `Mapset by ${map.beatmapset.creator} | ${stored === true ? "Uranked score saved!": ""}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

    let description: string = "";

    if (leaderboard !== undefined) {
        description += `**Global Top #${leaderboard + 1}** `;
    }

    if (top100 !== undefined) {
        description += `**Personal Best #${top100 + 1}**`;
    }

    if (description !== undefined) {
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


    if (interaction) {
        interaction.editReply({ content: `Try #${retries}`, embeds: [fullsize] }).then(() => setTimeout(function () {
            const currentTimeInSeconds = Math.floor(new Date(play.created_at).getTime() / 1000)
            const compact = new MessageEmbed()
                .setThumbnail(`${map.beatmapset.covers.list}`)
                .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
                .setColor(color)
                .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}] [${difficulty.star.toFixed(2)}★]`)
                .setURL(`${map.url}`)
                .setFooter({ text: `Mapset by ${map.beatmapset.creator} | ${stored === true ? "Uranked score saved!": ""}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

            if (description !== undefined) {
                compact.setDescription(description);
            }

            switch (play.mode) {
                case "osu":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [**${play.max_combo}x**/${map.max_combo}x]  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
                case "mania":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [ **${play.max_combo}x** ]  {${play.statistics.count_geki}/${play.statistics.count_300}/${play.statistics.count_katu}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
                case "taiko":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [**${play.max_combo}x**/${map.max_combo}x]  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
                case "fruits":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [**${play.max_combo}x**/${map.max_combo}x]  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
            }

            interaction.editReply({ embeds: [compact] });
        }, 60000));
    } else {
        message.reply({ content: `Try #${retries}`, embeds: [fullsize] }).then((msg) => setTimeout(function () {
            const currentTimeInSeconds = Math.floor(new Date(play.created_at).getTime() / 1000)
            const compact = new MessageEmbed()
                .setThumbnail(`${map.beatmapset.covers.list}`)
                .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
                .setColor(color)
                .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}] [${difficulty.star.toFixed(2)}★]`)
                .setURL(`${map.url}`)
                .setFooter({ text: `Mapset by ${map.beatmapset.creator} | ${stored === true ? "Uranked score saved!": ""}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })

            if (description !== undefined) {
                compact.setDescription(description);
            }

            switch (play.mode) {
                case "osu":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [**${play.max_combo}x**/${map.max_combo}x]  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
                case "mania":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [ **${play.max_combo}x** ]  {${play.statistics.count_geki}/${play.statistics.count_300}/${play.statistics.count_katu}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
                case "taiko":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [**${play.max_combo}x**/${map.max_combo}x]  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
                case "fruits":
                    compact.addFields([
                        {
                            name: `**${rankEmote} ${progressString} ${appliedmods == "+" ? "" : appliedmods}**    ${replaceDots(play.score)}    (${replaceDots((play.accuracy * 100).toFixed(2))}%)\nMap attempted <t:${currentTimeInSeconds}:R>`,
                            value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}pp  [**${play.max_combo}x**/${map.max_combo}x]  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
                            inline: true
                        },
                    ])
                    break;
            }

            msg.edit({ embeds: [compact] });
        }, 60000));
    }
}