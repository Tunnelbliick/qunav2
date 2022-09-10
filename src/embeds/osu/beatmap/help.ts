import { MessageEmbed } from "discord.js";

export function helpmap(prefix: string) {

    let embed = new MessageEmbed()
        .setTitle("Help map")
        .setDescription("Shows stats for a beatmap.\nIf no map is given, will choose the last map it can find in the last 50 messages.")
        .setColor(0x737df9)
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}map [map url] [mods]\``
            },
            {
                name: "map url",
                value: `Gets a specific map e.g \`${prefix}map https://osu.ppy.sh/beatmaps/2194260\``
            },
            {
                name: "mods",
                value: "Specific mods to apply for the map e.g `HDHR` or `+HDHR`"
            },
            {
                name: "examples",
                value:
                    `\`${prefix}map https://osu.ppy.sh/beatmaps/2194260 HRHD\`\n` +
                    `\`${prefix}map https://osu.ppy.sh/beatmaps/2194260 +HRHD\``,
                inline: true
            },
            {
                name: "aliases",
                value: `\`${prefix}m\` \`${prefix}map\``,
                inline: true
            });


    return embed;
}
