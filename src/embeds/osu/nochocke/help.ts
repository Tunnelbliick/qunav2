import { MessageEmbed } from "discord.js";

export function helpNoChocke(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help nochocke")
        .setDescription("Shows unchocked top plays of a user.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}nc [username] [<flag> <value>]\``
            },
            {
                name: "username",
                value: `Get the top plays of a specific user. Can be the exact username or a mention e.g \`${prefix}nc Tunnelblick\` or \`${prefix}nc @Tunnelblick\``
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
                    `\`${prefix}top Tunnelblick\`\n` +
                    `\`${prefix}top Tunnelblick -s Kira Kira Days\`\n` +
                    `\`${prefix}top Tunnelblick -s Cookie -a 99 100\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}nochocke\` \`${prefix}nc\``,
                inline: true
            });


    return embed;
}
