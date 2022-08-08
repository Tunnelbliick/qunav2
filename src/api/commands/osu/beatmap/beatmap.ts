import { ICommand } from "wokcommands";
import { buildMapEmbed } from "../../../../embeds/osu/beatmap/beatmap";
import { buildErrEmbed } from "../../../../embeds/osu/beatmap/error";
import { getBeatmap, getBeatmapSet } from "../../../osu/beatmap";

export async function beatmap(message: any, args: any) {

    let url = "";
    let mods = "";

    message.channel.sendTyping();

    if (message.reference != null) {
        let reference_id: any = message.reference?.messageId;
        let reference_message = await message.channel.messages.fetch(reference_id);
        let embed = reference_message.embeds[0];
        url = embed.url;
    }

    if (!args[0] || !args[0].startsWith("https")) {
        await message.channel.messages.fetch({ limit: 50 }).then((messages: any) => {
            messages.forEach((mes: any) => {

                if (url != "") {
                    return;
                }

                for (let embed of mes.embeds) {
                    if (embed.url != null && embed.url?.includes("//osu.ppy.sh/beatmap")) {
                        url = embed.url;
                    }
                    if (url != "") {
                        break;
                    }
                }
            });
        })
        if (args[0]) {
            mods = args[0];
        }
    } else {
        url = args[0];
        mods = args[1];
    }

    let id = args[0];
    let setid = "";

    let isSet = false;

    if (url.includes("//osu.ppy.sh/beatmapsets/")) {
        let split = url.split("beatmapsets/")[1];
        let para = split.split("/");

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
        let split = url.split("beatmaps/")[1];
        id = sanitize(split);
        isSet = false;
    }

    if (isSet == true)

        await getBeatmapSet(setid).then((data: any) => {
            id = data.beatmaps[data.beatmaps.length - 1].id;
        });

    await getBeatmap(id).then((data: any) => {

        try {
            buildMapEmbed(data, message, mods);
        } catch (err) {
            buildErrEmbed(err, message);
            return;
        }

    })

}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}