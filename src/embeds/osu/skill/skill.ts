import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { retry } from "ts-retry-promise";
import { normalise, skill_score, skill_type } from "../../../api/skills/skills";
import { OsuScore } from "../../../interfaces/OsuScore";
import { Score } from "../../../interfaces/Score";
import score from "../../../models/score";
import { replaceFirstDots } from "../../../utility/comma";
import { rank_icons } from "../../../utility/icons";
import { buildModString } from "../../../utility/score";

export async function generateSkillsEmbed(skills: skill_type[], user: any, message: any) {

    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    const row = new MessageActionRow();
    const actionComponents: MessageButton[] = [];

    let bottomString = "";
    let topString = "**Top 100 skills:**\n";

    for (const skill of skills) {

        if(skill.average === 0) {
            continue;
        }
        
        bottomString += `**Top ${skill.label} skills:**\n`

        let symbol = "p";

        if (skill.label === "Star") {
            symbol = "★";
        }

        const button = new MessageButton()
            .setCustomId(`${message.id}_${skill.label}`)
            .setLabel(skill.label)
            .setStyle('PRIMARY')

        actionComponents.push(button);


        topString += `${skill.label}: \`${skill.average.toFixed(2)}${symbol}\`\n`

        for (const skill_score of skill.scores.slice(0, 3)) {

            const score = skill_score.score;
            // @ts-ignore 
            const rank = rank_icons[score.rank];
            let appliedmods: any = buildModString(score)
            let value = skill_score.value
            if(skill.label !== "Star")
            value = normalise(skill_score.value);
            const map = `\`${value.toFixed(2)}${symbol}\` ${rank} [${score.beatmapset.title} [${score.beatmap.version}]](${score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
            bottomString += map;
        }
        bottomString += "\n";
    }

    const embed = new MessageEmbed()
        .setThumbnail(`${user.avatar_url} `)
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)} pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url} `, url: `https://osu.ppy.sh/users/${user.id}` })
        .setColor("#4b67ba")
        .setDescription(
            `${topString}\n${bottomString}`
        );


    const filter = (i: any) => {

        const find = actionComponents.find((button: MessageButton) => button.customId === i.customId );

        if (find) {
            return true;
        } else {
            return false;
        }
    }

    row.addComponents(actionComponents);

    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 })

    const reply = await message.reply({ embeds: [embed], components: [row] });

    collector.on("collect", async (i: any) => {

        const para = i.customId.split("_")[1];

        let valuestring = "";
        let accumelated = 0;
        let top_10_avg = 0;
        let header = "";
        let index = 0;
        let symbol = "p";

        const skill = skills.find((skill: skill_type) => skill.label === para);

        if (skill) {
            header = `**Top 20 ${skill.label} skills:**\n`;
            if (skill.label === "Star") {
                symbol = "★";
            }
            for (const skill_score of skill.scores.slice(0, 20)) {

                const score: OsuScore = skill_score.score;
                // @ts-ignore 
                const rank = rank_icons[score.rank];
                let appliedmods: any = buildModString(score)
                if (skill.label === "Star") {
                    const value = skill_score.value;
                    const map = `\`${value.toFixed(2)}★\` ${rank} [${score.beatmapset.title} [${score.beatmap.version}]](${score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
                    accumelated += value;
                    valuestring += map;
                } else {
                    const weight = Math.pow(0.95, index);
                    const value = normalise(skill_score.value);
                    const valued = value * weight;
                    const map = `\`${value.toFixed(2)}p ${(weight * 100).toFixed(0)}% -> ${valued.toFixed(2)}p\` ${rank} [${score.beatmapset.title} [${score.beatmap.version}]](${score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
                    accumelated += value;
                    valuestring += map;
                }
                index++;
            }
        }
        
        top_10_avg = accumelated / 20;

        const edit_embed = new MessageEmbed()
            .setThumbnail(`${user.avatar_url} `)
            .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)} pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url} `, url: `https://osu.ppy.sh/users/${user.id}` })
            .setColor("#4b67ba")
            .setDescription(
                `${header}\n` +
                `**Average**: \`${top_10_avg.toFixed(2)}${symbol}\`\n\n` +
                `${valuestring}`
            );

        collector.resetTimer();

        await reply.edit({ embeds: [edit_embed], components: [row] });
        await i.deferUpdate();
    })

    collector.on("end", async (_: any, reason: any) => {

        actionComponents.forEach((button: MessageButton) => {
            button.setDisabled(true);
        })

        await reply.edit({ embeds: [embed], components: [row] });
    });
}