import { MessageEmbed } from "discord.js";

export function helplink(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help link")
        .setDescription("Links ur osu! account with quna.")
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}link\``
            },
            {
                name: "aliases",
                value: `\`${prefix}link\` \`/link\``,
                inline: true
            });


    return embed;
}
