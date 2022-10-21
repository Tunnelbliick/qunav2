import { MessageEmbed } from "discord.js";

export function helpapex(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help apex")
        .setDescription("Shows the current map rotation for Apex legends")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}apex\``
            },
            {
                name: "aliases",
                value: `\`${prefix}apex\` \`${prefix}apexmap\``,
                inline: true
            });


    return embed;
}