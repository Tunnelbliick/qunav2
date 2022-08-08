import { Message, MessageEmbed } from "discord.js";
import { generateProfileChart } from "../../../api/chart.js/profile/profile";
import { gamemode_icons, rank_icons } from "../../../utility/icons";
import { noUserFound } from "../../utility/nouserfound";

const DataImageAttachment = require("dataimageattachment");

export async function buildProfileEmbed(data: any, message: Message, mode: string) {

    if (data.hasOwnProperty("error")) {
        noUserFound(message);
        return;
    }

    // playtime calc
    const time = Math.floor(data.statistics.play_time / 3600)

    // better join date
    const joinDate = new Date(data.join_date)

    // ranks
    let global_rank = data.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = data.statistics.country_rank;
    if (country_rank == null)
        country_rank = 0;

    // if no previous usernames
    let usernames = `Also known previously as: ${(data.previous_usernames)}`
    if (data.previous_usernames.length == 0) {
        usernames = `Player retains original name! Pog!`
    }

    // @ts-ignore 
    let gamemode = gamemode_icons[mode];

    let result = await generateProfileChart(data);

    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setThumbnail(`${data.avatar_url}`)
        .setAuthor({ name: `${data.username} - ${data.statistics.pp.toFixed(2)}pp | #${global_rank.toLocaleString()} (${data.country_code}${country_rank})`, url: `https://osu.ppy.sh/users/${data.id}/${mode}` })
        .setDescription(`**Mode**: ${gamemode}\n\n${usernames}\nPlaystyle: ${(data.playstyle)}`)
        .setImage(`attachment://${data.id}_graph.png`)
        .setFooter({ text: `Joined on ${joinDate.toLocaleDateString('de-DE')}` })
        .addFields([
            {
                name: "Ranked Score",
                value: `${(data.statistics.ranked_score).toLocaleString()}`,
                inline: true
            },
            {
                name: "Hit Accuracy",
                value: `${(data.statistics.hit_accuracy).toFixed(2)}%`,
                inline: true
            },
            {
                name: "Level",
                value: `${data.statistics.level.current}.${data.statistics.level.progress}`,
                inline: true
            },
            {
                name: "Total Score",
                value: `${(data.statistics.total_score).toLocaleString()}`,
                inline: true
            },
            {
                name: "Max Combo",
                value: `${(data.statistics.maximum_combo).toLocaleString()}`,
                inline: true
            },
            {
                name: "Followers",
                value: `${(data.follower_count).toLocaleString()}`,
                inline: true
            },
            {
                name: "Grades",
                value: `${rank_icons.XH}: ${data.statistics.grade_counts.ssh} | ${rank_icons.X}: ${data.statistics.grade_counts.ss} | ${rank_icons.SH}: ${data.statistics.grade_counts.sh} | ${rank_icons.S}: ${data.statistics.grade_counts.s} | ${rank_icons.A}: ${data.statistics.grade_counts.a}`,
                inline: false
            },
            {
                name: "Forum Posts",
                value: `${(data.post_count).toLocaleString()}`,
                inline: true
            },
            {
                name: "Beatmap Comments",
                value: `${(data.comments_count).toLocaleString()}`,
                inline: true
            },
            {
                name: "Mapping Followers",
                value: `${(data.mapping_follower_count).toLocaleString()}`,
                inline: true
            },
            {
                name: "Play Count | Time",
                value: `${(data.statistics.play_count).toLocaleString()} | ${time.toLocaleString()} hours`,
                inline: true
            },
            {
                name: "Replays Watched By",
                value: `${data.statistics.replays_watched_by_others.toLocaleString()} players`,
                inline: true
            }
        ])


    message.channel.send({ embeds: [embed], files: [new DataImageAttachment(result, `${data.id}_graph.png`)] }).then((msg) => setTimeout(function () {
        const compact = new MessageEmbed()
            .setThumbnail(`${data.avatar_url}`)
            .setAuthor({ name: `${data.username}'s Profile`, url: `https://osu.ppy.sh/users/${data.id}` })
            .setColor(0x737df9)
            .setTitle(`${data.statistics.pp.toFixed(2)}pp | #${global_rank.toLocaleString()} (${data.country_code}${country_rank.toLocaleString()})`)
            .setDescription(`**Mode**: ${gamemode}`)
            .setImage(`attachment://${data.id}_graph.png`)
            .addFields([
                {
                    name: "Ranked Score",
                    value: `${(data.statistics.ranked_score).toLocaleString()}`,
                    inline: true
                },
                {
                    name: "Hit Accuracy",
                    value: `${(data.statistics.hit_accuracy).toFixed(2)}%`,
                    inline: true
                },
                {
                    name: "Level",
                    value: `${data.statistics.level.current}.${data.statistics.level.progress}`,
                    inline: true
                },
            ])

        msg.edit({ embeds: [compact], files: [new DataImageAttachment(result, `${data.id}_graph.png`)] });
    }, 60000));
}