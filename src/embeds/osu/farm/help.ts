import { MessageEmbed } from "discord.js";

export function helpFarmhours(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help farm hours")
        .setDescription("Shows amount of top 100 Scores set at specific hours of day.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}fh [username] [offset]\``
            },
            {
                name: "username",
                value: `Get farmhours for a specific user. Can be the exact username or a mention e.g \`${prefix}fh Tunnelblick\` or \`${prefix}fh @Tunnelblick\``
            },
            {
                name: "offset",
                value: `Offset to use for the graph e.g \`${prefix}fh +6\` \`${prefix}fh -2\``,
            },
            {
                name: "examples",
                value:
                    `\`${prefix}fh Tunnelblick\`\n` +
                    `\`${prefix}fh Tunnelblick +10\`\n` +
                    `\`${prefix}fh Tunnelblick -8\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}fh\` \`${prefix}farmhours\``,
                inline: true
            });


    return embed;
}

export function helpFarmdays(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help farm days")
        .setDescription("Shows amount of top 100 Scores set at specific days of week.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}fd [username] [offset]\``
            },
            {
                name: "username",
                value: `Get farmdays for a specific user. Can be the exact username or a mention e.g \`${prefix}fd Tunnelblick\` or \`${prefix}fd @Tunnelblick\``
            },
            {
                name: "mode",
                value: `Changes the gamemode to display the graph for e.g \`${prefix}fd -m osu\` or \`${prefix}fd -m mania\``
            },
            {
                name: "offset",
                value: `Offset to use for the graph e.g \`${prefix}fd +6\` \`${prefix}fd -2\``,
            },
            {
                name: "examples",
                value:
                    `\`${prefix}fd Tunnelblick\`\n` +
                    `\`${prefix}fd Tunnelblick +10\`\n` +
                    `\`${prefix}fd Tunnelblick -8\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}fd\` \`${prefix}farmdays\``,
                inline: true
            });


    return embed;
}

export function helpFramWeeks(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help farm weeks")
        .setDescription("Shows amount of top 100 Scores set at specific week of year.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}fw [username] [offset]\``
            },
            {
                name: "username",
                value: `Get farmdays for a specific user. Can be the exact username or a mention e.g \`${prefix}fw Tunnelblick\` or \`${prefix}fw @Tunnelblick\``
            },
            {
                name: "offset",
                value: `Offset to use for the graph e.g \`${prefix}fw +6\` \`${prefix}fw -2\``,
            },
            {
                name: "examples",
                value:
                    `\`${prefix}fw Tunnelblick\`\n` +
                    `\`${prefix}fw Tunnelblick +10\`\n` +
                    `\`${prefix}fw Tunnelblick -8\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}fw\` \`${prefix}farmweeks\``,
                inline: true
            });


    return embed;
}

export function helpFarmMonth(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help farm months")
        .setDescription("Shows amount of top 100 Scores set at specific month of year.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}fm [username] [offset]\``
            },
            {
                name: "username",
                value: `Get farmmonth for a specific user. Can be the exact username or a mention e.g \`${prefix}fm Tunnelblick\` or \`${prefix}fm @Tunnelblick\``
            },
            {
                name: "offset",
                value: `Offset to use for the graph e.g \`${prefix}fm +6\` \`${prefix}fm -2\``,
            },
            {
                name: "examples",
                value:
                    `\`${prefix}fm Tunnelblick\`\n` +
                    `\`${prefix}fm Tunnelblick +10\`\n` +
                    `\`${prefix}fm Tunnelblick -8\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}fm\` \`${prefix}farmmonth\``,
                inline: true
            });


    return embed;
}



