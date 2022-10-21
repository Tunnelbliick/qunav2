import { invalidMapUrl, missingParameters } from "../../../../../embeds/osu/recommend/suggest/error";
import { getBeatmap, getBeatmapSet } from "../../../../osu/beatmap";
import { suggest, suggestion } from "../../../../recommend/suggest/suggest";

export async function suggestion(message: any, args: any, prefix: any) {

    let url = "";
    const mods = "";
    let optionmode = "";
    let error = undefined;
    let id;
    let setid = "";
    let isSet = false;
    let modstring = "";
    const categories = [];

    message.channel.sendTyping();

    if (message.reference !== null) {
        const reference_id: any = message.reference?.messageId;
        const reference_message = await message.channel.messages.fetch(reference_id);
        const embed = reference_message.embeds[0];
        url = embed.url;
    }

    for (const arg of args) {
        if (url !== undefined) {
            if (arg.includes("//osu.ppy.sh/beatmapsets/")) {
                const split = arg.split("beatmapsets/")[1];
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

            if (arg.includes("//osu.ppy.sh/beatmaps/")) {
                const split = arg.split("beatmaps/")[1];
                id = sanitize(split);
                isSet = false;
            }
        }

        if (arg == "-m") {
            optionmode = "mod"
            continue;
        }
        if (arg == "-c") {
            optionmode = "category"
            continue;
        }
        if (optionmode === "mod") {
            modstring += arg;
        }
        if (optionmode === "category") {
            categories.push(arg);
        }
    }

    
    if (isSet == true) {
        await getBeatmapSet(+setid).then((data: any) => {
            id = data.beatmaps[data.beatmaps.length - 1].id;
        });
    }


    if (id === undefined) {
        error = "invalid_url";
    }

    if (error === undefined && categories.length === 0) {
        error = "no_categorie";
    }


    switch(error){
        case "invalid_url":
            invalidMapUrl(url, message, prefix);
            break;
        case "no_categorie":
            missingParameters(message, prefix);
            break;
    }

    if(error !== undefined) {
        return;
    }

    const beatmap = await getBeatmap(id);

    const suggestion: suggestion = {
        beatmap: beatmap,
        mod_string: modstring,
        categories: categories
    }

    suggest(suggestion, message, prefix);
}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}