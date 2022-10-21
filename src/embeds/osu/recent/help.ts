import { MessageEmbed } from "discord.js";

export function helpRecent(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help recent")
        .setDescription("Shows the most recent play of a user.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}rs [index] [username] [<flag> <value>]\``
            },
            {
                name: "index",
                value: `Get a specific previous score e.g \`${prefix}rs 10\` to get the 10th most recent score.`,
            },
            {
                name: "username",
                value: `Get the score of a specific user. Can be the exact username or a mention e.g \`${prefix}rs Tunnelblick\` or \`${prefix}rs @Tunnelblick\``
            },
            {
                name: "flags",
                value:
                    "**-s**/**search [text]**: To search for a specific map\n" +
                    "**-f**/**fail [true/false]**: To enable/disabled inclusion of failed plays\n" +
                    "**-m**/**mods [text]**: To search for a play with specific mods\n" +
                    "**-r**/**rank [SS/S..D/F]**: To search for a play with a specific rank acchieved"
            },
            {
                name: "examples",
                value:
                    `\`${prefix}rs Tunnelblick\`\n` +
                    `\`${prefix}rs 10 Tunnelblick\`\n` +
                    `\`${prefix}rs Tunnelblick -r A\`\n` +
                    `\`${prefix}rs 10 Tunnelblick -s Euphoria -f false\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}r\` \`${prefix}rs\` \`${prefix}recent\``,
                inline: true
            });


    return embed;
}