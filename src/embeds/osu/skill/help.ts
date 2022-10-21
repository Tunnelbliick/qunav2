import { MessageEmbed } from "discord.js";

export function helpskills(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help top skills")
        .setDescription("Shows the top skills for a user")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}skills [username]\``
            },
            {
                name: "username",
                value: `Get top skills for a specific user. Can be the exact username or a mention e.g \`${prefix}skills Tunnelblick\` or \`${prefix}skills @Tunnelblick\``
            },
            {
                name: "examples",
                value:
                    `\`${prefix}skills Tunnelblick\`\n` +
                    `\`${prefix}osu Tunnelblick -ts\`\n` +
                    `\`${prefix}skills @Tunnelblick\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}skills\` \`${prefix}topskills\` \`${prefix}osu -ts\``,
                inline: true
            });


    return embed;
}