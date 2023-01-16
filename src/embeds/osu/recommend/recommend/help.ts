import { MessageEmbed } from "discord.js";

export function helprecommend(prefix: string) {
    const embed = new MessageEmbed()
        .setTitle("Help recommend")
        .setColor(0x737df9)
        .setImage("https://cdn.discordapp.com/attachments/940446029436821517/1064670340346818560/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f352f35322f436f6c6c61626f7261746976655f66696c746572696e672e676966_1.gif")
        .setDescription("Requests a beatmap recommendation. **Only works for Standard atm**\n\n" +
            "**How does this work?**\n\n" +
            "Quna uses something called collaberative filtering. With collaberative filtering you look at the likes and dislikes of a lot of users and predict if a user will like a certain thing based on the feedback of other users.\n\n" +
            "**Will there be manual search?**\n\n" +
            "Probably yes in the future the ai approach has no idea about star raiting, pp or anything of that sort so if you want something specific you will have to take the manual approach.")
        .setFields([
            {
                name: "Usage",
                value: `\`${prefix}rec\``
            },{
                name: "examples",
                value:
                    `\`${prefix}rec\``

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