import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { all_skills, normalise } from "../../../api/skills/skills";
import { replaceFirstDots } from "../../../utility/comma";
import { rank_icons } from "../../../utility/icons";

export async function generateSkillsEmbed(skills: all_skills, user: any, message: any) {

    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    let starString = "";
    let aimString = "";
    let speedString = "";
    let accString = "";

    for (const a of skills.star.slice(0, 3)) {
        // @ts-ignore 
        const rank = rank_icons[a.score.rank];
        const mods: Array<string> = a.score.mods;
        let appliedmods: any = "+";
        mods.forEach(m => { appliedmods += m });
        const map = `\`${a.value.toFixed(2)}★\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
        starString += map;
    }

    for (const a of skills.aim.slice(0, 3)) {
        // @ts-ignore 
        const rank = rank_icons[a.score.rank];
        const mods: Array<string> = a.score.mods;
        let appliedmods: any = "+";
        mods.forEach(m => { appliedmods += m });
        const map = `\`${normalise(a.value).toFixed(2)}p\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
        aimString += map;
    }

    for (const a of skills.speed.slice(0, 3)) {
        // @ts-ignore 
        const rank = rank_icons[a.score.rank];
        const mods: Array<string> = a.score.mods;
        let appliedmods: any = "+";
        mods.forEach(m => { appliedmods += m });
        const map = `\`${normalise(a.value).toFixed(2)}p\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
        speedString += map;
    }

    for (const a of skills.acc.slice(0, 3)) {
        // @ts-ignore 
        const rank = rank_icons[a.score.rank];
        const mods: Array<string> = a.score.mods;
        let appliedmods: any = "+";
        mods.forEach(m => { appliedmods += m });
        const map = `\`${normalise(a.value).toFixed(2)}p\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
        accString += map;
    }

    const embed = new MessageEmbed()
        .setThumbnail(`${user.avatar_url} `)
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)} pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url} `, url: `https://osu.ppy.sh/users/${user.id}` })
        .setColor("#4b67ba")
        .setDescription(
            "**Top 100 skills:**\n" +
            `Star: \`${skills.star_avg.toFixed(2)}★\`\n` +
            `Aim: \`${skills.aim_avg.toFixed(2)}p\`\n` +
            `Speed: \`${skills.speed_avg.toFixed(2)}p\`\n` +
            `Acc: \`${skills.acc_avg.toFixed(2)}p\`\n\n` +
            "**Top star skills:**\n" +
            `${starString}\n` +
            "**Top aim skills:**\n" +
            `${aimString}\n` +
            "**Top speed skills:**\n" +
            `${speedString}\n` +
            "**Top accuracy skills:**\n" +
            `${accString}`
        );


    const row = new MessageActionRow();

    const star_button = new MessageButton()
        .setCustomId(`${message.id}_star`)
        .setLabel("Star")
        .setStyle('PRIMARY')
    const aim_button = new MessageButton()
        .setCustomId(`${message.id}_aim`)
        .setLabel("Aim")
        .setStyle('PRIMARY')
    const speed_button = new MessageButton()
        .setCustomId(`${message.id}_speed`)
        .setLabel("Speed")
        .setStyle('PRIMARY')
    const acc_button = new MessageButton()
        .setCustomId(`${message.id}_acc`)
        .setLabel("Accuracy")
        .setStyle('PRIMARY')

    row.addComponents([star_button, aim_button, speed_button, acc_button])


    const filter = (i: any) => {
        return i.customId === star_button.customId ||
            i.customId === aim_button.customId ||
            i.customId === speed_button.customId ||
            i.customId === acc_button.customId;
    }

    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 })

    const reply = await message.reply({ embeds: [embed], components: [row] });

    collector.on("collect", async (i: any) => {

        const para = i.customId.split("_")[1];

        let valuestring = "";
        let accumelated = 0;
        let top_10_avg = 0;
        let header = "";
        let index = 0;
        let symbol = "★";

        switch (para) {
            case "star":
                header = "**Top 20 star skills:**\n";
                symbol = "★";
                for (const a of skills.star.slice(0, 20)) {
                    // @ts-ignore 
                    const rank = rank_icons[a.score.rank];
                    const mods: Array<string> = a.score.mods;
                    let appliedmods: any = "+";
                    mods.forEach(m => { appliedmods += m });
                    const value = a.value;
                    const map = `\`${value.toFixed(2)}★\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
                    accumelated += value;
                    valuestring += map;
                }

                break;
            case "aim":
                header = "**Top 20 aim skills:**\n";
                symbol = "p";
                index = 0;
                for (const a of skills.aim.slice(0, 20)) {
                    // @ts-ignore 
                    const rank = rank_icons[a.score.rank];
                    const mods: Array<string> = a.score.mods;
                    let appliedmods: any = "+";
                    mods.forEach(m => { appliedmods += m });
                    const weight = Math.pow(0.95, index);
                    const value = normalise(a.value);
                    const valued = value * weight;
                    const map = `\`${value.toFixed(2)}p ${(weight * 100).toFixed(0)}% -> ${valued.toFixed(2)}p\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
                    accumelated += value;
                    valuestring += map;
                    index++;
                }
                break;
            case "speed":
                header = "**Top 20 speed skills:**\n";
                symbol = "p";
                index = 0;
                for (const a of skills.speed.slice(0, 20)) {
                    // @ts-ignore 
                    const rank = rank_icons[a.score.rank];
                    const mods: Array<string> = a.score.mods;
                    let appliedmods: any = "+";
                    mods.forEach(m => { appliedmods += m });
                    const weight = Math.pow(0.95, index);
                    const value = normalise(a.value);
                    const valued = value * weight;
                    const map = `\`${value.toFixed(2)}p ${(weight * 100).toFixed(0)}% -> ${valued.toFixed(2)}p\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
                    accumelated += value;
                    valuestring += map;
                    index++;
                }
                break;
            case "acc":
                header = "**Top 20 accuracy skills:**\n";
                symbol = "p";
                index = 0;
                for (const a of skills.acc.slice(0, 20)) {
                    // @ts-ignore 
                    const rank = rank_icons[a.score.rank];
                    const mods: Array<string> = a.score.mods;
                    let appliedmods: any = "+";
                    mods.forEach(m => { appliedmods += m });
                    const weight = Math.pow(0.95, index);
                    const value = normalise(a.value);
                    const valued = value * weight;
                    const map = `\`${value.toFixed(2)}p ${(weight * 100).toFixed(0)}% -> ${valued.toFixed(2)}p\` ${rank} [${a.score.beatmapset.title} [${a.score.beatmap.version}]](${a.score.beatmap.url}) ${appliedmods == "+" ? "" : "**" + appliedmods + "**"}\n`
                    accumelated += value;
                    valuestring += map;
                    index++;
                }
                break;
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

        star_button.setDisabled(true);
        aim_button.setDisabled(true);
        speed_button.setDisabled(true);
        acc_button.setDisabled(true);

        await reply.edit({ embeds: [embed], components: [row] });
    });
}