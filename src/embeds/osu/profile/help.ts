import { MessageEmbed } from "discord.js";

export function helpprofile(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help profile")
        .setDescription("Shows the user profile.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}p [username]\` or gamemode name`
            },
            {
                name: "username",
                value: `Gets the profile for a specific user. Can be the exact username or a mention e.g \`${prefix}p Tunnelblick\` or \`${prefix}p @Tunnelblick\``
            },
            {
                name: "examples",
                value:
                    `\`${prefix}p Tunnelblick\`\n` +
                    `\`${prefix}p @Tunnelblick\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}p\` \`${prefix}profile\``,
                inline: true
            });


    return embed;
}