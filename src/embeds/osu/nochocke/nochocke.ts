import { MessageEmbed } from "discord.js";
import { BeatmapStats, calcualteStatsforMods } from "../../../api/beatmaps/stats";
import { getMaxForCurrentNoChockeArray } from "../../../api/osu/top";
import { replaceFirstDots } from "../../../utility/comma";
import { rank_icons } from "../../../utility/icons";
import { modeIntToMode } from "../../../api/osu/utility/utility";
import { buildModString } from "../../../utility/score";

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

export async function nochockeEmbed(data: any, user: any, index: number, max: number, total_pp: number, unchocked_pp: number, difference: number) {

    let fields = `${total_pp.toFixed(2)}pp → **${unchocked_pp.toFixed(2)}pp** | +${difference.toFixed(2)}\n\n`;

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
        promises.push(getMaxForCurrentNoChockeArray(item));
    }

    const playsPromiseList: any = await Promise.all(promises).catch(error => {
        console.error("Page still processing, retry in 10 seconds");
        return;
    })

    playsPromiseList.forEach((score: any) => {
        plays.push(score);
    })

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

}

function genereateField(play: any) {

    const score = play.value;

    const beatmap = play.beatmap.value;
    const maxpp = play.maxpp.value.pp[100];
    const difficulty = play.difficulty.value;

    if (score == null || beatmap == null || maxpp == null) {
        return null;
    }

    let appliedmods: any = buildModString(score);

    // @ts-ignore 
    const rankEmote: any = getGrade(score);
    const acc: any = calculateAcc(score);

    let scoreField = ""

    switch (modeIntToMode(score.ruleset_id)) {
        case "mania":
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.star.toFixed(2)}★]\n` +
                `${rankEmote} ${score.pp.toFixed(2)} → **${play.unchocked.toFixed(2)}pp** | ${(score.accuracy * 100).toFixed(2)}% → **${acc.toFixed(2)}%**\n` +
                `[**${score.max_combo}x**] Removed ${score.statistics.count_miss == 1 ? "1 miss" : score.statistics.count_miss + " misses"}\n`
            break;
        default:
            scoreField =
                `**${play.position + 1}.** [${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"} [${difficulty.star.toFixed(2)}★]\n` +
                `${rankEmote} ${score.pp.toFixed(2)} → **${play.unchocked.toFixed(2)}pp** | ${(score.accuracy * 100).toFixed(2)}% → **${acc.toFixed(2)}%**\n` +
                `[${score.max_combo}x → **${difficulty.max_combo}x**/${difficulty.max_combo}x] Removed ${score.statistics.count_miss == 1 ? "1 miss" : score.statistics.count_miss + " misses"}\n`
            break;
    }
    return scoreField;

}

function getGrade(play: any) {

    switch (modeIntToMode(play.ruleset_id)) {
        case "osu": {
            const total_objects = play.beatmap.count_circles + play.beatmap.count_sliders + play.beatmap.count_spinners;
            const n300_percent = 100 / total_objects * (total_objects - play.statistics.count_100 - play.statistics.count_50);
            const n50_percent = 100 / total_objects * play.statistics.count_50;
            const miss = 0;

            if (play.accuracy === 1) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.XH
                } else {
                    return rank_icons.SH
                }
            } else if (miss === 0 && n300_percent > 90 && n50_percent < 1) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.SH
                } else {
                    return rank_icons.S
                }
            } else if ((miss === 0 && n300_percent > 80) || n300_percent > 90) {
                return rank_icons.A
            } else if ((miss === 0 && n300_percent > 70) || n300_percent > 80) {
                return rank_icons.B
            } else if (n300_percent > 60) {
                return rank_icons.C
            } else {
                return rank_icons.D
            }
        }
        case "taiko": {
            const total_objects = play.beatmap.count_circles + play.beatmap.count_sliders + play.beatmap.count_spinners;
            const n300_percent = 100 / total_objects * (total_objects - play.statistics.count_100 - play.statistics.count_50);
            const n100 = play.statistics.count_100;

            if (play.accuracy === 1) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.XH
                } else {
                    return rank_icons.SH
                }
            } else if (n300_percent > 90 && n100 < 10 / total_objects) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.SH
                } else {
                    return rank_icons.S
                }
            } else if (n300_percent > 80 || n100 < 5 / total_objects) {
                return rank_icons.A
            } else if (n300_percent > 70 || n100 < 3.33 / total_objects) {
                return rank_icons.B
            } else if (n300_percent > 60) {
                return rank_icons.C
            } else {
                return rank_icons.D
            }
        }
        case "fruits": {
            const total_fruits = play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss + play.statistics.count_katu;
            const acc = 100 * ((play.statistics.count_300 + play.statistics.count_miss + play.statistics.count_100 + play.statistics.count_50) / (total_fruits))

            if (play.accuracy === 1) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.XH
                } else {
                    return rank_icons.SH
                }
            } else if (acc > .98) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.SH
                } else {
                    return rank_icons.S
                }
            } else if (acc > .94) {
                return rank_icons.A;
            } else if (acc > .90) {
                return rank_icons.B;
            } else if (acc > .85) {
                return rank_icons.C;
            } else {
                return rank_icons.D;
            }
        }
        case "mania": {
            const top = (300 * (play.statistics.count_300 + play.statistics.count_geki + play.statistics.count_miss)) + (200 * play.statistics.count_katu) + (100 * play.statistics.count_100) + (50 * play.statistics.count_50)
            const bottom = 300 * (play.statistics.count_300 + play.statistics.count_geki + play.statistics.count_katu + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss)
            const acc = top / bottom;

            console.log(acc);

            if (play.accuracy === 1) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.XH
                } else {
                    return rank_icons.SH
                }
            } else if (acc > .95) {
                if (play.mods.includes("HD") || play.mods.includes("FL")) {
                    return rank_icons.SH
                } else {
                    return rank_icons.S
                }
            } else if (acc > .90) {
                return rank_icons.A;
            } else if (acc > .80) {
                return rank_icons.B;
            } else if (acc > .70) {
                return rank_icons.C;
            } else {
                return rank_icons.D;
            }
        }

    }
}

function calculateAcc(play: any) {

    const total_objects = play.beatmap.count_circles + play.beatmap.count_sliders + play.beatmap.count_spinners;

    switch (modeIntToMode(play.ruleset_id)) {
        case "osu":
            return (100 * (6 * (total_objects - play.statistics.count_100 - play.statistics.count_50) + 2 * play.statistics.count_100 + play.statistics.count_50) / (6 * total_objects));
        case "taiko":
            return 100 * ((play.statistics.count_300 + play.statistics.count_miss) + (0.5 * play.statistics.count_100)) / (play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_miss)
        case "fruits":
            const total_fruits = play.statistics.count_300 + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss + play.statistics.count_katu;
            return 100 * ((play.statistics.count_300 + play.statistics.count_miss + play.statistics.count_100 + play.statistics.count_50) / (total_fruits))
        case "mania":
            const top = (300 * (play.statistics.count_300 + play.statistics.count_geki + play.statistics.count_miss)) + (200 * play.statistics.count_katu) + (100 * play.statistics.count_100) + (50 * play.statistics.count_50)
            const bottom = 300 * (play.statistics.count_300 + play.statistics.count_geki + play.statistics.count_katu + play.statistics.count_100 + play.statistics.count_50 + play.statistics.count_miss)
            return 100 * top / bottom;

    }

}
