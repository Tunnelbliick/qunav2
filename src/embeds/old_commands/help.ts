import { MessageEmbed } from "discord.js";

export function help8ball(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help 8ball")
        .setDescription("Ask Quna and her magic 8-Ball about something!")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}8ball [question]\``
            },
            {
                name: "aliases",
                value: `\`${prefix}8ball\``,
                inline: true
            });


    return embed;
}

export function helpchoose(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help choose")
        .setDescription("Let Quna pick from multiple options!")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}choose [option1] [option2]..\``
            },
            {
                name: "aliases",
                value: `\`${prefix}choose\``,
                inline: true
            });


    return embed;
}

export function helpwaifu(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help waifurating")
        .setDescription("Quna will rate a name you give her!")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}rate [name]\``
            },
            {
                name: "aliases",
                value: `\`${prefix}rate\` \`${prefix}waifu\` \`${prefix}waifurating\``,
                inline: true
            });


    return embed;
}