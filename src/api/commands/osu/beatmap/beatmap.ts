import { ICommand } from "wokcommands";
import { buildMapEmbed } from "../../../../embeds/osu/beatmap/beatmap";
import { buildErrEmbed } from "../../../../embeds/osu/beatmap/error";
import { getBeatmap, getBeatmapSet } from "../../../osu/beatmap";

export async function beatmap(message: any, interaction: any, args: any) {

    let url = "";
    let mods = "";
    let id = undefined;
    let setid = "";
    let isSet = false;

    if (message && message.reference != null) {
        const reference_id: any = message.reference?.messageId;
        const reference_message = await message.channel.messages.fetch(reference_id);
        const embed = reference_message.embeds[0];
        url = embed.url;
    }

    for (const arg of args) {
        if (arg.includes("//osu.ppy.sh/beatmapsets/") || arg.includes("//osu.ppy.sh/beatmaps/") || isNaN(arg) === false) {
            url = arg;
            id = arg;
        } else {
            mods = arg;
        }
    }

    if (url === "" || id === undefined) {
        let channel = undefined;

        if (interaction) {
            channel = interaction.channel;
        } else {
            channel = message.channel;
        }

        await channel.messages.fetch({ limit: 50 }).then((messages: any) => {
            messages.forEach((mes: any) => {

                if (url != "") {
                    return;
                }

                for (const embed of mes.embeds) {
                    if (embed.url != null && embed.url?.includes("//osu.ppy.sh/beatmap")) {
                        url = embed.url;
                    }
                    if (url != "") {
                        break;
                    }
                }
            });
        })
    }

    if (url.includes("//osu.ppy.sh/beatmapsets/")) {
        const split = url.split("beatmapsets/")[1];
        const para = split.split("/");

        if (para.length == 2) {
            id = sanitize(para[1]);
        }
        else if (para.length == 1) {
            setid = sanitize(para[0]);
            isSet = true;
        }
        else {
            return;
        }
    }

    if (url.includes("//osu.ppy.sh/beatmaps/")) {
        const split = url.split("beatmaps/")[1];
        id = sanitize(split);
        isSet = false;
    }

    if (isSet == true)
        await getBeatmapSet(+setid).then((data: any) => {
            id = data.beatmaps[data.beatmaps.length - 1].id;
        });

    const data = await getBeatmap(id)

    try {
        buildMapEmbed(data, message, interaction, mods);
    } catch (err) {
        buildErrEmbed(err, message);
        return;
    }

}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}