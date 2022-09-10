import { MessageEmbed } from "discord.js";

export function helpshowsuggestions(prefix: string) {
    let embed = new MessageEmbed()
        .setTitle("Help show suggestions")
        .setColor(0x737df9)
        .setDescription("Shows your or other peoples suggestions")
        .setFields([
            {
                name: "Usage",
                value: `\`${prefix}suggestions [username] [<flag> <value>]\``
            }, {
                name: "username",
                value: `Show suggestions from a specific user. Can be the exact username or a mention e.g \`${prefix}suggestions Tunnelblick\` or \`${prefix}suggestions @Tunnelblick\``
            }, {
                name: "flags",
                value:
                    "**-s**/**search [text]**: To search for a specific map.\n" +
                    "**-ar [<number/>number]**: To search for ar less or greater as or a range e.g `-ar <9` `-ar >10` `-ar 8 10`\n" +
                    "**-hp [<number/>number]**: To search for hp less or greater as or a range e.g `-hp <9` `-hp >10` `-hp 8 10`\n" +
                    "**-od [<number/>number]**: To search for od less or greater as or a range e.g `-od <9` `-od >10` `-od 8 10`\n" +
                    "**-cs [<number/>number]**: To search for cs less or greater as or a range e.g `-cs <9` `-cs >10` `-cs 8 10`\n" +
                    "**-bpm [<number/>number]**: To search for bpm less or greater as or a range e.g `-bpm <220` `-bpm >180` `-bpm 180 200`\n" +
                    "**-d [<number/>number]**: To search for star raiting less or greater as or a range e.g `-d <8` `-d >6` `-d 5 6.5`\n" +
                    "**-c [text]**: To search for a specific category e.g `-c streams` `-c jumps`\n"
            }, {
                name: "examples",
                value:
                    `\`${prefix}!suggestions Tunnelblick\`\n` +
                    `\`${prefix}!suggestions Tunnelblick -s Doki Doki\`\n` +
                    `\`${prefix}!suggestions Tunnelblick -ar >9 -bpm >180\`\n`

            },
            {
                name: "alaises",
                value:
                    `\`${prefix}suggestions\` \`${prefix}ss\` \`${prefix}shows\` \`${prefix}showsug\` \`${prefix}showsuggestions\``,
                inline: true
            }
        ]);

    return embed;
}
