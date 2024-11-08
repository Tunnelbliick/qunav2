
import { Interaction, Message, MessageEmbed } from "discord.js";
import { BeatmapStats, calcualteStatsforMods } from "../../../api/beatmaps/stats";
import { generateBeatmapChart } from "../../../api/chart.js/beatmap/beatmap";
import { beatmap } from "../../../api/osu/beatmap";
import { parseModString } from "../../../api/osu/utility/parsemods";
import { loadMapPP } from "../../../api/pp/db/loadmap";
import { Recommendation } from "../../../interfaces/Recommendation";
import { RecommendationInfo } from "../../../interfaces/RecommendationInfo";
import { getDifficultyColor } from "../../../utility/gradiant";
import { gamemode_icons } from "../../../utility/icons";
import { buildMapInfo } from "../../../utility/score";
const { Canvas, loadImage } = require('skia-canvas');
const DataImageAttachment = require("dataimageattachment");

export async function buildMapEmbed(data: any, message: Message, interaction: any, mods: string) {

    if (data.hasOwnProperty("error")) {
        if (interaction) {
            interaction.reply("I could not find a beatmap");
        } else {
            message.reply("I could not find a beatmap");
        }
        return;
    }

    const { embed, result } = await buildMapEmbedNoResponse(mods, data);

    if (interaction) {
        await interaction.editReply({ embeds: [embed], files: [new DataImageAttachment(result, "chart.png")] })
    } else {
        await message.reply({ embeds: [embed], files: [new DataImageAttachment(result, "chart.png")] })
    }
}

export async function buildMapEmbedNoResponse(mods: string, data: any) {
    const modArray = parseModString(mods);
    let modString = "";

    if (modArray.length >= 1) {
        modString = "+";
        modArray.forEach((mod: any) => modString += `${mod}`);
    }

    let difficulty;
    let graph;
    let map_stats: any;
    let ppString: string;
    let background: any;

    const statsPromise = loadMapPP(data, modArray, data.mode_int);
    const backgroundPromise = loadImage(data.beatmapset.covers.cover);

    await Promise.allSettled([statsPromise, backgroundPromise]).then((result: any) => {
        map_stats = result[0].value;
        background = result[1].value;
    });

    if (data.max_combo == null) {
        data.max_combo = map_stats.max_combo;
    }

    if (map_stats != undefined) {
        difficulty = map_stats.difficulty;
        graph = map_stats.graph;
        ppString = buildpp(map_stats.pp, data.mode);
    } else {
        ppString = "Could not load PP values";
    }

    const chartURL = await generateBeatmapChart(graph);
    const chart = await loadImage(chartURL);

    const canvas = new Canvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    ctx.filter = 'blur(7px) brightness(33%)';
    ctx.drawImage(background, 0, 0);
    ctx.filter = 'none';
    ctx.drawImage(chart, 0, 0);

    const result = canvas.toDataURLSync();

    let stats: BeatmapStats = {
        cs: data.cs,
        hp: data.drain,
        bpm: data.beatmapset.bpm,
        mapLength: data.total_length,
        mapDrain: data.hit_length
    };

    stats = calcualteStatsforMods(stats, modArray);

    // extras
    const successrate = Math.round((data.passcount / data.playcount) * 100);
    const embedColor = getDifficultyColor((difficulty.stars ?? 0).toFixed(2));

    // @ts-ignore 
    const modeEmote = gamemode_icons[data.mode];

    const embed = new MessageEmbed()
        .setAuthor({ name: `Mapset by ${data.beatmapset.creator}`, iconURL: `https://a.ppy.sh/${data.beatmapset.user_id}`, url: `https://osu.ppy.sh/users/${data.beatmapset.user_id}` })
        .setColor(embedColor)
        .setTitle(`${data.beatmapset.artist} - ${data.beatmapset.title}`)
        .setURL(`${data.url}`)
        .setDescription(`🎶 [Song Preview](https:${data.beatmapset.preview_url}) 🖼️ [Background Image](${data.beatmapset.covers.cover})`)
        .setImage(`attachment://chart.png`) // the @2x version does not work sadge
        .setFooter({ text: `▶ : ${data.playcount.toLocaleString()} plays, ${data.passcount.toLocaleString()} passes (${successrate}% Passrate) | ❤ : ${data.beatmapset.favourite_count.toLocaleString()} | ${cap1stLetter(data.status)}` });

    if (data.mode != "mania") {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `${buildMapInfo(stats, difficulty)}`,
                inline: true
            },
            {
                name: `Download`,
                value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${data.id})\n[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
                inline: true
            },
            {
                name: "PP",
                value: `\n\`\`\`${ppString}\`\`\``,
                inline: false
            }
        ]);
    } else {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `${buildMapInfo(stats, difficulty)}`,
                inline: true
            },
            {
                name: `Download`,
                value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${data.id})\n[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
                inline: true
            },
            {
                name: "PP",
                value: `\n\`\`\`${ppString}\`\`\``,
                inline: false
            }
        ]);
    }
    return { embed, result };
}

export async function buildMapEmbedMoreLikeThis(mods: string, data: any, index: any, score: any) {
    const modArray = parseModString(mods);
    let modString = "";

    if (modArray.length >= 1) {
        modString = "+";
        modArray.forEach((mod: any) => modString += `${mod}`);
    }

    let difficulty;
    let graph;
    let map_stats: any;
    let ppString: string;
    let background: any;

    const statsPromise = loadMapPP(data, modArray, data.mode);
    const backgroundPromise = loadImage(data.beatmapset.covers.cover);

    await Promise.allSettled([statsPromise, backgroundPromise]).then((result: any) => {
        map_stats = result[0].value;
        background = result[1].value;
    });

    if (map_stats != undefined) {
        difficulty = map_stats.difficulty;
        graph = map_stats.graph;

        ppString = buildpp(map_stats.pp, data.mode);
    } else {
        ppString = "Could not load PP values";
    }

    const chartURL = await generateBeatmapChart(graph);
    const chart = await loadImage(chartURL);

    const canvas = new Canvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    ctx.filter = 'blur(7px) brightness(33%)';
    ctx.drawImage(background, 0, 0);
    ctx.filter = 'none';
    ctx.drawImage(chart, 0, 0);

    const result = canvas.toDataURLSync();

    let stats: BeatmapStats = {
        cs: data.cs,
        hp: data.drain,
        bpm: data.beatmapset.bpm,
        mapLength: data.total_length,
        mapDrain: data.hit_length
    };

    stats = calcualteStatsforMods(stats, modArray);

    // extras
    const successrate = Math.round((data.passcount / data.playcount) * 100);
    const embedColor = getDifficultyColor(difficulty.stars.toFixed(2));

    // @ts-ignore 
    const modeEmote = gamemode_icons[data.mode];

    const embed = new MessageEmbed()
        .setAuthor({ name: `Mapset by ${data.beatmapset.creator}`, iconURL: `https://a.ppy.sh/${data.beatmapset.user_id}`, url: `https://osu.ppy.sh/users/${data.beatmapset.user_id}` })
        .setColor(embedColor)
        .setTitle(`${data.beatmapset.artist} - ${data.beatmapset.title}`)
        .setURL(`${data.url}`)
        .setDescription(`🎶 [Song Preview](https:${data.beatmapset.preview_url}) 🖼️ [Background Image](${data.beatmapset.covers.cover})`)
        .setImage(`attachment://chart.png`) // the @2x version does not work sadge
        .setFooter({ text: `Similar map ${index + 1} of 10 | Score ${score.toFixed(2)}` });

    if (data.mode != "mania") {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `Combo: \`${data.max_combo}x\` Stars: \`${difficulty.stars.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${data.id})\n[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
                inline: true
            },
            {
                name: "PP",
                value: `\n\`\`\`${ppString}\`\`\``,
                inline: false
            }
        ]);
    } else {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `Stars: \`${difficulty.stars.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${data.id})\n[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
                inline: true
            },
            {
                name: "PP",
                value: `\n\`\`\`${ppString}\`\`\``,
                inline: false
            }
        ]);
    }
    return { embed, result };
}

export async function buildMapEmbedRecommendation(rec: Recommendation, data: beatmap, index: number, recInfo: RecommendationInfo) {
    let modString = "";

    if (rec.mods.length >= 1) {
        modString = "+";
        rec.mods.forEach((mod: any) => modString += `${mod}`);
    }

    const currentTime = new Date();

    // Get the minutes of the current time
    const currentMinutes = currentTime.getMinutes();

    // Calculate the last full half-hour of the current time
    if (currentMinutes <= 30) {
        currentTime.setMinutes(30, 0, 0)
    } else {

        currentTime.setHours(+currentTime.getHours() + 1, 0, 0, 0);

    }

    // Calculate the time difference between the current time and the next half-hour or hour
    const timeDiff = new Date(currentTime.getTime() - recInfo.createdAt.getTime());

    // Extract the remaining minutes and seconds from the time difference
    const remainingMinutes = timeDiff.getMinutes();
    const remainingSeconds = timeDiff.getSeconds();

    // Format the remaining time into a string
    let remainingTimeString;
    if (remainingMinutes > 32) {
        remainingTimeString = `Refresh available`;
    } else if (remainingMinutes > 32) {
        remainingTimeString = `Building refresh`;
    } else if (remainingMinutes > 0) {
        remainingTimeString = `Refresh in ${remainingMinutes}m`;
    } else {
        remainingTimeString = `Refresh in ${remainingSeconds}s`;
    }

    let difficulty;
    let graph;
    let map_stats: any;
    let ppString: string;
    let background: any;

    const statsPromise = loadMapPP(data, rec.mods, data.mode_int);
    const backgroundPromise = loadImage(data.beatmapset.covers.cover);

    await Promise.allSettled([statsPromise, backgroundPromise]).then((result: any) => {
        map_stats = result[0].value;
        background = result[1].value;
    });

    if (map_stats != undefined) {
        difficulty = map_stats.difficulty;
        graph = map_stats.graph;

        ppString = buildpp(map_stats.pp, data.mode);
    } else {
        ppString = "Could not load PP values";
    }

    const chartURL = await generateBeatmapChart(graph);
    const chart = await loadImage(chartURL);

    const canvas = new Canvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    ctx.filter = 'blur(7px) brightness(33%)';
    ctx.drawImage(background, 0, 0);
    ctx.filter = 'none';
    ctx.drawImage(chart, 0, 0);

    const result = canvas.toDataURLSync();

    let stats: BeatmapStats = {
        cs: data.cs,
        hp: data.drain,
        bpm: data.beatmapset.bpm,
        mapLength: data.total_length,
        mapDrain: data.hit_length
    };

    stats = calcualteStatsforMods(stats, rec.mods);

    // extras
    const embedColor = getDifficultyColor(difficulty.stars.toFixed(2));

    // @ts-ignore 
    const modeEmote = gamemode_icons[data.mode];

    const embed = new MessageEmbed()
        .setAuthor({ name: `Mapset by ${data.beatmapset.creator}`, iconURL: `https://a.ppy.sh/${data.beatmapset.user_id}`, url: `https://osu.ppy.sh/users/${data.beatmapset.user_id}` })
        .setColor(embedColor)
        .setTitle(`${data.beatmapset.artist} - ${data.beatmapset.title}`)
        .setURL(`${data.url}`)
        .setDescription(`🎶 [Song Preview](https:${data.beatmapset.preview_url}) 🖼️ [Background Image](${data.beatmapset.covers.cover})`)
        .setImage(`attachment://chart.png`) // the @2x version does not work sadge
        .setFooter({ text: `Recommendation ${index + 1} of ${recInfo.length} | Score: ${rec.score.toFixed(2)} | ${remainingTimeString}` });

    if (data.mode != "mania") {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `Combo: \`${data.max_combo}x\` Stars: \`${difficulty.stars.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${data.id})\n[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
                inline: true
            },
            {
                name: "PP",
                value: `\n\`\`\`${ppString}\`\`\``,
                inline: false
            }
        ]);
    } else {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `Stars: \`${difficulty.stars.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${data.id})\n[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
                inline: true
            },
            {
                name: "PP",
                value: `\n\`\`\`${ppString}\`\`\``,
                inline: false
            }
        ]);
    }
    return { embed, result };
}


function center(text: string, length: number): string {
    const space = length - text.length;
    const spac: string = " ";
    const count = Math.round(space / 2);
    if (space % 2) {
        return spac.repeat(count - 1) + text + spac.repeat(count);
    }
    return spac.repeat(count) + text + spac.repeat(count);

}

function buildpp(pp_values: { [key: string]: { [accuracy: string]: number } }, mode: string): string {

    if (pp_values[100] != undefined) {
        return build_old(pp_values[100], pp_values[99], pp_values[97], pp_values[95], mode);
    }

    if (mode !== "osu") {
        return build_old(pp_values[0][100], pp_values[0][99], pp_values[0][97], pp_values[0][95], mode);
    }

    const separator = "─";
    const columnWidth = 6; // Define a fixed width for each column

    // Helper function to pad strings to a fixed width
    function pad(text: string, length: number): string {
        return text.padStart(Math.floor((length + text.length) / 2)).padEnd(length);
    }

    // Default headers and prefix
    let a95 = pad("95%", columnWidth);
    let a97 = pad("97%", columnWidth);
    let a99 = pad("99%", columnWidth);
    let a100 = pad("100%", columnWidth);
    let pre = pad(" Miss", 2);

    // Build the header and separator lines
    let results = `${pre} │ ${a95} │ ${a97} │ ${a99} │ ${a100}\n`;
    results += `──────┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 1)}\n`;

    // Iterate through each miss value and format the pp values
    for (const miss in pp_values) {
        const acc95 = pad(pp_values[miss][95].toFixed(1).slice(0, columnWidth), columnWidth + 2);
        const acc97 = pad(pp_values[miss][97].toFixed(1).slice(0, columnWidth), columnWidth + 2);
        const acc99 = pad(pp_values[miss][99].toFixed(1).slice(0, columnWidth), columnWidth + 2);
        const acc100 = pad(pp_values[miss][100].toFixed(1).slice(0, columnWidth), columnWidth + 2);

        results += ` ${pad(miss + "x", 4)} │${acc95}│${acc97}│${acc99}│${acc100}\n`;
    }

    return results;
}

export function buildppIfLessMiss(original_pp: number, pp_values: number[], original_miss: number): string {

    const separator = "─";
    const columnWidth = 4; // Define a fixed width for each column

    // Helper function to pad strings to a fixed width
    function pad(text: string, length: number): string {
        return text.padStart(Math.floor((length + text.length) / 2)).padEnd(length);
    }

    // Default headers and prefix


    let pre = pad(`Miss`, columnWidth + 2);
    let results = `${pre}`;

    for (let miss in pp_values) {
        let missString = pad(`${original_miss - +miss}x`, columnWidth + 2);
        results += `│${missString}`;
    }

    results += "\n";

    // Build the header and separator lines

    results += `${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}┼${separator.repeat(columnWidth + 2)}\n`;

    results += pad(`${original_pp.toFixed(1).slice(0, columnWidth + 1)}`, columnWidth + 2);

    for (let miss of pp_values) {

        if (miss == undefined)
            continue;

        let missString = pad(`${miss.toFixed(1).slice(0, columnWidth + 1)}`, columnWidth + 2);
        results += `│${missString}`;
    }

    return results;
}

function build_old(acc100: any, acc99: any, acc97: any, acc95: any, mode: any): string {

    const seper = "─";

    let a95 = "95%";
    let a97 = "97%";
    let a99 = "99%";
    let a100 = "100%";

    let pre = "Acc"

    if (mode == "mania") {
        a95 = " 700.000 ";
        a97 = " 820.000 ";
        a99 = " 940.000 ";
        a100 = "1.000.000 ";
        pre = "   "
        acc95 = center(acc95.toFixed(1), a95.length - 2);
        acc97 = center(acc97.toFixed(1), a97.length - 2);
        acc99 = center(acc99.toFixed(1), a99.length - 2);
        acc100 = center(acc100.toFixed(1), a100.length - 2);
    } else {
        a95 = center(a95, acc95.toFixed(1).length + 2);
        a97 = center(a97, acc97.toFixed(1).length + 2);
        a99 = center(a99, acc99.toFixed(1).length + 2);

        acc95 = acc95.toFixed(1);
        acc97 = acc97.toFixed(1);
        acc99 = acc99.toFixed(1);
        acc100 = acc100.toFixed(1);
    }

    const fill = `────┼${seper.repeat(a95.length)}┼${seper.repeat(a97.length)}┼${seper.repeat(a99.length)}┼`

    const total_length = fill.length + acc100.length + 2

    const buildString = `${pre} │${a95}│${a97}│${a99}│ ${a100} \n${fill}${seper.repeat(total_length - fill.length)} \nPP  │ ${acc95} │ ${acc97} │ ${acc99} │ ${acc100} `;

    return buildString;

}

function cap1stLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}