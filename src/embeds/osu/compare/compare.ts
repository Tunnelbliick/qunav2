import { Message, MessageEmbed } from "discord.js";
import { replaceDots, replaceFirstDots } from "../../../utility/comma";
import { getDifficultyColor } from "../../../utility/gradiant";
import { rank_icons } from "../../../utility/icons";

export function generateCompareEmbed(map: any, user: any, scoreList: Array<any>, top100: any, leaderboard: any, message: Message, interaction: any) {

    let fields: any[] = [];

    let index = 0;

    scoreList.forEach((play) => {
        index++;

        let acc100 = play.acc100.pp[100];
        let max_combo = map.max_combo;
        let difficulty = play.difficulty.star.toFixed(2);
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

    let color = getDifficultyColor(map.difficulty_rating);

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

    var currentTimeInSeconds = Math.floor(new Date(play.created_at).getTime() / 1000)

    let mods: Array<String> = play.mods;
    let appliedmods: any = "+";
    mods.forEach(m => { appliedmods += m });

    // @ts-ignore 
    let rankEmote: any = rank_icons[play.rank];

    let playField = {
        name: `${counter}. ${rankEmote} ${appliedmods == "+" ? "" : appliedmods}  [${difficulty}★]  ${replaceDots(play.score)}  (${replaceDots((play.accuracy * 100).toFixed(2))}%)`,
        value: `**${ppOfPlay.toFixed(2)}**/${acc100.toFixed(2)}PP  **${play.max_combo}x**/${max_combo}x  {${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}} <t:${currentTimeInSeconds}:R>`,
        inline: false
    }

    return playField;
}
