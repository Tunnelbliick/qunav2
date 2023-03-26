
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

    const statsPromise = loadMapPP(data, modArray, data.mode);
    const backgroundPromise = loadImage(data.beatmapset.covers.cover);

    await Promise.allSettled([statsPromise, backgroundPromise]).then((result: any) => {
        map_stats = result[0].value;
        background = result[1].value;
    });

    if (map_stats != undefined) {
        difficulty = map_stats.difficulty;
        graph = map_stats.graph;
        const acc100 = map_stats.pp[100].toFixed(1);
        const acc99 = map_stats.pp[99].toFixed(1);
        const acc97 = map_stats.pp[97].toFixed(1);
        const acc95 = map_stats.pp[95].toFixed(1);

        ppString = buildpp(acc100, acc99, acc97, acc95, data.mode);
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
    const embedColor = getDifficultyColor(difficulty.star.toFixed(2));

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
                value: `Combo: \`${data.max_combo}x\` Stars: \`${difficulty.star.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
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
                value: `Stars: \`${difficulty.star.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
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
    if(currentMinutes >= 30) {
        currentTime.setMinutes(30, 0, 0)
    } else {

        currentTime.setMinutes(0,0,0);
        currentTime.setHours(+currentTime.getHours() + 1);

    }
    
    // Calculate the time difference between the current time and the next half-hour or hour
    const timeDiff = new Date(recInfo.createdAt.getTime() - currentTime.getTime());
    
    // Extract the remaining minutes and seconds from the time difference
    const remainingMinutes = timeDiff.getMinutes();
    const remainingSeconds = timeDiff.getSeconds();
    
    // Format the remaining time into a string
    let remainingTimeString;
    if (remainingMinutes > 0) {
      remainingTimeString = `${remainingMinutes}m`;
    } else {
      remainingTimeString = `${remainingSeconds}s`;
    }

    let difficulty;
    let graph;
    let map_stats: any;
    let ppString: string;
    let background: any;

    const statsPromise = loadMapPP(data, rec.mods, data.mode);
    const backgroundPromise = loadImage(data.beatmapset.covers.cover);

    await Promise.allSettled([statsPromise, backgroundPromise]).then((result: any) => {
        map_stats = result[0].value;
        background = result[1].value;
    });

    if (map_stats != undefined) {
        difficulty = map_stats.difficulty;
        graph = map_stats.graph;
        const acc100 = map_stats.pp[100].toFixed(1);
        const acc99 = map_stats.pp[99].toFixed(1);
        const acc97 = map_stats.pp[97].toFixed(1);
        const acc95 = map_stats.pp[95].toFixed(1);

        ppString = buildpp(acc100, acc99, acc97, acc95, data.mode);
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
    const embedColor = getDifficultyColor(difficulty.star.toFixed(2));

    // @ts-ignore 
    const modeEmote = gamemode_icons[data.mode];

    const embed = new MessageEmbed()
        .setAuthor({ name: `Mapset by ${data.beatmapset.creator}`, iconURL: `https://a.ppy.sh/${data.beatmapset.user_id}`, url: `https://osu.ppy.sh/users/${data.beatmapset.user_id}` })
        .setColor(embedColor)
        .setTitle(`${data.beatmapset.artist} - ${data.beatmapset.title}`)
        .setURL(`${data.url}`)
        .setDescription(`🎶 [Song Preview](https:${data.beatmapset.preview_url}) 🖼️ [Background Image](${data.beatmapset.covers.cover})`)
        .setImage(`attachment://chart.png`) // the @2x version does not work sadge
        .setFooter({ text: `Recommendation ${index + 1} of ${recInfo.length} | Score: ${rec.score.toFixed(2)} | Refresh in ${remainingTimeString}` });

    if (data.mode != "mania") {
        embed.addFields([
            {
                name: `${modeEmote} [${data.version}] ${modString}`,
                value: `Combo: \`${data.max_combo}x\` Stars: \`${difficulty.star.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
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
                value: `Stars: \`${difficulty.star.toFixed(2)}★\`\n` +
                    `Length: \`${stats.min}:${stats.strSec}\` (\`${stats.dmin}:${stats.strDsec}\`) Objects: \`${data.count_circles + data.count_sliders + data.count_spinners}\`\n` +
                    `CS:\`${stats.cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${difficulty.hp.toFixed(2).replace(/[.,]00$/, "")}\` BPM: \`${stats.bpm.toFixed(2).replace(/[.,]00$/, "")}\``,
                inline: true
            },
            {
                name: `Download`,
                value: `[osu-web](https://osu.ppy.sh/beatmapsets/${data.beatmapset_id}/download)\n[Beatconnect](https://beatconnect.io/b/${data.beatmapset_id})`,
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

function buildpp(acc100: any, acc99: any, acc97: any, acc95: any, mode: any): string {

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
        acc95 = center(acc95.toString(), a95.length - 2);
        acc97 = center(acc97.toString(), a97.length - 2);
        acc99 = center(acc99.toString(), a99.length - 2);
        acc100 = center(acc100.toString(), a100.length - 2);
    } else {
        a95 = center(a95, acc95.toString().length + 2);
        a97 = center(a97, acc97.toString().length + 2);
        a99 = center(a99, acc99.toString().length + 2);
    }

    const fill = `────┼${seper.repeat(a95.length)}┼${seper.repeat(a97.length)}┼${seper.repeat(a99.length)}┼`

    const total_length = fill.length + acc100.toString().length + 2

    const buildString = `${pre} │${a95}│${a97}│${a99}│ ${a100}\n${fill}${seper.repeat(total_length - fill.length)}\nPP  │ ${acc95} │ ${acc97} │ ${acc99} │ ${acc100}`;

    return buildString;

}

function cap1stLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}