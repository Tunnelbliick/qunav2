import { MessageEmbed } from "discord.js";

export function helpPickem(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help Pickem")
        .setDescription("Brings up the current pickem, more information in the pickem embed")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}pickem\``
            },
            {
                name: "aliases",
                value: `\`${prefix}pickem\``,
                inline: true
            });


    return embed;
}

export function helpPredictions(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help Predictions")
        .setDescription("Shows the Predictions of a specific user")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}predictions [username]\``
            },
            {
                name: "username",
                value: `Get predictions for a specific user. Can be the exact username or a mention e.g \`${prefix}predictions Tunnelblick\` or \`${prefix}predictions @Tunnelblick\``
            },
            {
                name: "examples",
                value:
                    `\`${prefix}predictions Tunnelblick\` \`${prefix}predictions @Tunnelblick\`\n`,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}predictions\``,
                inline: true
            });


    return embed;
}
