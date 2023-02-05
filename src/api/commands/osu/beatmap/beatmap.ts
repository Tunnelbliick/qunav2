import { ICommand } from "wokcommands";
import { buildMapEmbed } from "../../../../embeds/osu/beatmap/beatmap";
import { buildErrEmbed } from "../../../../embeds/osu/beatmap/error";
import { getBeatmap, getBeatmapSet } from "../../../osu/beatmap";
import { checkForBeatmap } from "../../../utility/checkForBeatmap";

export async function beatmap(message: any, interaction: any, args: any) {

    let url = "";

    if (message && message.reference != null) {
        const reference_id: any = message.reference?.messageId;
        const reference_message = await message.channel.messages.fetch(reference_id);
        const embed = reference_message.embeds[0];
        url = embed.url;
    }

    let result: any = await checkForBeatmap(message, interaction, args);

    if (result.isSet == true)
        await getBeatmapSet(+result.setid).then((data: any) => {
            result.id = data.beatmaps[data.beatmaps.length - 1].id;
        });

    const data = await getBeatmap(result.id)

    try {
        buildMapEmbed(data, message, interaction, result.mods);
    } catch (err) {
        buildErrEmbed(err, message);
        return;
    }

}