import { MessageEmbed } from "discord.js";

export function helprecommend(prefix: string) {
    let embed = new MessageEmbed()
        .setTitle("Help recommend")
        .setColor(0x737df9)
        .setDescription("Requests a beatmap recommendation.\n" +
            "Can be empty to let Quna take the wheel.\n\n" +
            "The request engine works on matching user likes to each other and serving recommendations based on that.\nIf there isnt sufficent information for the recommnedation engine the results will be quite trivial.")
        .setFields([
            {
                name: "Usage",
                value: `\`${prefix}rec [<flag> <value>]\``
            }, {
                name: "flags",
                value:
                    "**-s**/**search [text]**: To search for a specific map.\n" +
                    "**-c**/**category [text]**: To search for a specific category.\n" +
                    "**-ar [<number/>number]**: To search for ar less or greater as or a range e.g `-ar <9` `-ar >10` `-ar 8 10`\n" +
                    "**-hp [<number/>number]**: To search for hp less or greater as or a range e.g `-hp <9` `-hp >10` `-hp 8 10`\n" +
                    "**-od [<number/>number]**: To search for od less or greater as or a range e.g `-od <9` `-od >10` `-od 8 10`\n" +
                    "**-cs [<number/>number]**: To search for cs less or greater as or a range e.g `-cs <9` `-cs >10` `-cs 8 10`\n" +
                    "**-bpm [<number/>number]**: To search for bpm less or greater as or a range e.g `-bpm <220` `-bpm >180` `-bpm 180 200`\n" +
                    "**-d [<number/>number]**: To search for star raiting less or greater as or a range e.g `-d <8` `-d >6` `-d 5 6.5`\n"
            }, {
                name: "examples",
                value:
                    `\`${prefix}rec -s Uta\`\n` +
                    `\`${prefix}rec -t Tech\`\n` +
                    `\`${prefix}rec -t Streams -ar >9 -bpm >180\`\n`

            },
            {
                name: "alaises",
                value:
                    `\`${prefix}rec\` \`${prefix}recommend\``,
                inline: true
            }
        ]);

    return embed;
}