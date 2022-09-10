import { MessageEmbed } from "discord.js";

export function helposu(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help osu profile")
        .setDescription("Shows the user profile.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}osu [username]\``
            },
            {
                name: "username",
                value: `Gets teh profile for a specific user. Can be the exact username or a mention e.g \`${prefix}osu Tunnelblick\` or \`${prefix}osu @Tunnelblick\``
            },
            {
                name: "examples",
                value:
                    `\`${prefix}osu Tunnelblick\`\n` +
                    `\`${prefix}osu @Tunnelblick\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}o\` \`${prefix}osu\``,
                inline: true
            });


    return embed;
}