import { MessageEmbed } from "discord.js";

export function helpWorldCup(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help world cup")
        .setDescription("Look at the results of a world cup")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}owc [<flag> <value>]\``
            },
            {
                name: "flags",
                value:
                    "**-y**/**year [text]**: Year of the world cup e.g `-y 2021`\n" +
                    "**-c**/**country [text]**: Country to take a look at in the world cup\n" +
                    "**-m**/**mode [text]**: Mode to look for e.g `-m mania`\n" +
                    "**-k**/**keys [text]**: World cup for specific keys (mania only 4k/7K)"
            },
            {
                name: "examples",
                value:
                    `\`${prefix}owc\`\n` +
                    `\`${prefix}owc -y 2020\`\n` +
                    `\`${prefix}owc -y 2020 -c germany\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}owc\` \`${prefix}mwc\` \`${prefix}twc\` \`${prefix}cwc\``,
                inline: true
            });


    return embed;
}

export function helpWorldCupCompare(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help compare world cup")
        .setDescription("Compare world cup results")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}wcc\``
            },
            {
                name: "examples",
                value:
                    `\`${prefix}wcc\`\n`,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}wcc\``,
                inline: true
            });


    return embed;
}
