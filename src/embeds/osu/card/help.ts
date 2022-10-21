import { MessageEmbed } from "discord.js";

export function helpcard(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help card")
        .setDescription("Shows stats and represent them as a card")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}card [username]\``
            },
            {
                name: "username",
                value: `Get scores for a specific user. Can be the exact username or a mention e.g \`${prefix}card Tunnelblick\` or \`${prefix}card @Tunnelblick\``
            },
            {
                name: "examples",
                value:
                `\`${prefix}card Tunnelblick\`\n` +
                `\`${prefix}card @Tunnelblick\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}card\``,
                inline: true
            });


    return embed;
}