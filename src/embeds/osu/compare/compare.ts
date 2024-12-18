import { Message, MessageEmbed } from "discord.js";
import { replaceDots, replaceFirstDots } from "../../../utility/comma";
import { getDifficultyColor } from "../../../utility/gradiant";
import { rank_icons } from "../../../utility/icons";
import { buildModString, buildScoreString, buildStatisticString } from "../../../utility/score";

export function generateCompareEmbed(map: any, user: any, scoreList: Array<any>, top100: any, leaderboard: any, message: Message, interaction: any) {

    const fields: any[] = [];

    let index = 0;

    scoreList.forEach((play) => {
        index++;

        const acc100 = play.acc100.pp[0][100];
        const max_combo = map.max_combo;
        const difficulty = play.difficulty.stars.toFixed(2);
        let ppOfPlay = play.score.pp;
        if (play.hasOwnProperty('ppOfPlay')) {
            ppOfPlay = play.ppOfPlay;
        }
        fields.push(genereateField(index, play.score, acc100, difficulty, max_combo, ppOfPlay));
    })

    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    let description: string = "";

    if (leaderboard !== undefined) {
        description += `**Global Top #${leaderboard + 1}** `;
    }

    if (top100 !== undefined) {
        description += `**Personal Best #${top100 + 1}**`;
    }

    const color = getDifficultyColor(map.difficulty_rating);

    const compact = new MessageEmbed()
        .setThumbnail(`${map.beatmapset.covers.list}`)
        .setAuthor({ name: `${user.username}: ${user.statistics.pp.toFixed(2)}pp #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
        .setColor(color)
        .setTitle(`${map.beatmapset.artist} - ${map.beatmapset.title} [${map.version}]`)
        .setURL(`${map.url}`)
        .setFooter({ text: `Mapset by ${map.beatmapset.creator}`, iconURL: `https://a.ppy.sh/${map.beatmapset.user_id}` })
        .addFields(fields)
        .setDescription(description);

    if (fields.length == 0) {
        compact.setDescription("No scores found")
    }

    if (interaction) {
        interaction.editReply({ embeds: [compact] });
    } else {
        message.reply({ embeds: [compact] });
    }
}

function genereateField(counter: any, play: any, acc100: any, difficulty: any, max_combo: any, ppOfPlay?: any) {

    const currentTimeInSeconds = Math.floor(new Date(play.ended_at).getTime() / 1000)

    const mods = buildModString(play);

    // @ts-ignore 
    const rankEmote: any = rank_icons[play.rank];

    const playField = {
        name: `${counter}. ${rankEmote} ${mods == "+" ? "" : mods}  [${difficulty}★]  ${buildScoreString(play)}  (${replaceDots((play.accuracy * 100).toFixed(2))}%)`,
        value: `**${ppOfPlay != undefined ? ppOfPlay.toFixed(2) : "0"}**/${acc100.toFixed(2)}PP  **${play.max_combo}x**/${max_combo}x  ${buildStatisticString(play)} <t:${currentTimeInSeconds}:R>`,
        inline: false
    }

    return playField;
}
