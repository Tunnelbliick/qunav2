import { MessageEmbed } from "discord.js";

export function helpTimezone(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help timezone")
        .setDescription("Update your local timezone.\nIf no timezone is given will use the first timezone found for your country.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}tz [offset] <flag>\``
            },
            {
                name: "offset",
                value: `Offset to use for your localtimezone e.g \`${prefix}tz +6\` \`${prefix}tz -2\``,
            },
            {
                name: "flags",
                value: "**-r**: To remove the stored timezone."
            },
            {
                name: "examples",
                value:
                    `\`${prefix}tz \+6\`\n` +
                    `\`${prefix}tz -2\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}tz \` \`${prefix}timezone\``,
                inline: true
            });


    return embed;

}