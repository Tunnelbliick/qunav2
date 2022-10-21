import { MessageEmbed } from "discord.js";

export function helpsuggest(prefix: string) {
    const embed = new MessageEmbed()
        .setTitle("Help suggest")
        .setColor(0x737df9)
        .setDescription("Suggest a beatmap for quna users")
        .setFields([
            {
                name: "Usage",
                value: `\`${prefix}sug [url] -m [mods] -t [tags]\``
            }, {
                name: "-m mods",
                value: "Mods to use for this recommendation e.g `-m DTHD` `-m HR`"
            }, {
                name: "-c category",
                value:
                    "Category to use for the type of beatmap e.g `tech` `aim` **atleast one** category must be given for a new suggestions.\nTags can later be added and voted on for a beatmap by other users."
            }, {
                name: "examples",
                value:
                    `\`${prefix}sug https://osu.ppy.sh/beatmaps/3287875 -t tech\`\n` +
                    `\`${prefix}sug https://osu.ppy.sh/beatmaps/3287875 -m HD -t tech\``

            },
            {
                name: "alaises",
                value:
                    `\`${prefix}suggest\` \`${prefix}sug\` \`${prefix}s\``,
                inline: true
            }
        ]);

    return embed;
}
