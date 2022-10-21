import { Message, MessageEmbed } from "discord.js";
import { BeatmapStats } from "../../beatmaps/stats";
import { recommend } from "./recommend";

export interface suggestion_collector_params {
    difficulty: any,
    beatmap: any,
    stats: BeatmapStats,
    suggest: any,
    discard: any,
    message: any,
    categories: any,
    mods: any,
    embed: any,
    row: any,
}

export async function launchSuggestionCollector(params: suggestion_collector_params) {

    let embed = params.embed;
    const accept = params.suggest;
    const discard = params.discard;
    const message: Message = params.message;
    const beatmap = params.beatmap;
    const categories = params.categories;
    const mods = params.mods;
    const row = params.row;

    const filter = (i: any) => {
        return i.customId === accept.customId ||
            i.customId === discard.customId;
    }

    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 })

    collector.on("collect", async (i: any) => {

        const para = i.customId.split("_")
        const authorid = para[2]

        if (i.user.id != authorid) {
            i.reply("This is not your recommendation!")
            return;
        }

        switch (para[0]) {
            case "suggest":

                const rec = await recommend(params, i);

                if (rec === undefined) {
                    await i.deferUpdate();
                    break;
                }

                embed = new MessageEmbed().setAuthor({ name: `Suggested` })
                    .setColor(0x737df9)
                    .setTitle(`${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`)
                    .setURL(`${beatmap.url}`)
                    .setDescription("You have suggested the beatmap for the algorythm.");

                accept.setDisabled(true);
                discard.setDisabled(true);

                await message.edit({ embeds: [embed], components: [row] });
                await i.deferUpdate();
                break;

            case "discard":
                embed = new MessageEmbed().setAuthor({ name: `Discarded` })
                    .setColor(0x737df9)
                    .setTitle(`${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`)
                    .setURL(`${beatmap.url}`)
                    .setDescription("The suggestion was discarded.");

                accept.setDisabled(true);
                discard.setDisabled(true);

                await message.edit({ embeds: [embed], components: [row] });
                await i.deferUpdate();
                break;
        }

    });

    collector.on("end", async () => {

        accept.setDisabled(true);
        discard.setDisabled(true);

        await message.edit({ components: [row] });
    });

}