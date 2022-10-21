import { MessageEmbed } from "discord.js";

export function helprecentBest(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help recent best")
        .setDescription("Shows the recent best plays of a user.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}rb [index] [username] [<flag> <value>]\``
            },
            {
                name: "username",
                value: `Get the recent best plays of a specific user. Can be the exact username or a mention e.g \`${prefix}rb Tunnelblick\` or \`${prefix}rb @Tunnelblick\``
            },
            {
                name: "index",
                value: "Get a specific recent best e.g `!rb 10` to get the 10th most recent best.",
            },
            {
                name: "flags",
                value:
                    "**-s**/**search [text]**: To search for a specific maps\n" +
                    "**-m**/**mods [text]**: To search for a plays with specific mods\n" +
                    "**-c**/**combo [<number/>number]**: To search for combo less or greater as or a range e.g `-a <700` `-a >1800` `-c 300 600`\n" +
                    "**-a**/**acc [<number/>number]**: To search for acc less or greater as or a range e.g `-a <99` `-a >100` `-a 99 97.5`\n" +
                    "**-r**/**rank [SS/S..D/F]**: To search for a play with a specific ranks acchieved e.g `-r A B C D`\n" +
                    "**-sort [acc/combo/length]**: Different ways to sort\n" +
                    "**-reverse [true/false]**: To reverse the list"
            },
            {
                name: "examples",
                value:
                    `\`${prefix}rb Tunnelblick\`\n` +
                    `\`${prefix}rb Tunnelblick -s Kira Kira Days\`\n` +
                    `\`${prefix}rb Tunnelblick -s Cookie -a 99 100\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}rb\` \`${prefix}recentbest\``,
                inline: true
            });


    return embed;
}
