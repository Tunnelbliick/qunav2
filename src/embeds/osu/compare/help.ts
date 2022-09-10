import { MessageEmbed } from "discord.js";

export function helpcompare(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help compare")
        .setDescription("Shows user scores for a specific beatmap.\nIf no map is given, will choose the last map it can find in the last 50 messages.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}c [username] [map url]\``
            },
            {
                name: "username",
                value: `Get scores for a specific user. Can be the exact username or a mention e.g \`${prefix}c Tunnelblick\` or \`${prefix}c @Tunnelblick\``
            },
            {
                name: "map url",
                value: "Specific beatmap to get the scores from."
            },
            {
                name: "examples",
                value:
                    `\`${prefix}c Tunnelblick\`\n` +
                    `\`${prefix}c @Tunnelblick https://osu.ppy.sh/beatmaps/2194260\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}c\` \`${prefix}compare\``,
                inline: true
            });


    return embed;
}
