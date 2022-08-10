import { invalidMapUrl, missingParameters } from "../../../../../embeds/osu/recommend/suggest/error";
import { getBeatmap, getBeatmapSet } from "../../../../osu/beatmap";
import { suggest, suggestion } from "../../../../suggest/suggest";

export async function suggestion(message: any, args: any, prefix: any) {

    let url = "";
    let mods = "";
    let optionmode = "";
    let error = undefined;
    let id;
    let setid = "";
    let isSet = false;
    let modstring = "";
    let categories = [];

    message.channel.sendTyping();

    if (message.reference !== null) {
        console.log(`message ref: ${message.reference}`);
        let reference_id: any = message.reference?.messageId;
        let reference_message = await message.channel.messages.fetch(reference_id);
        let embed = reference_message.embeds[0];
        url = embed.url;
    }

    for (let arg of args) {
        if (url !== undefined) {
            if (arg.includes("//osu.ppy.sh/beatmapsets/")) {
                let split = arg.split("beatmapsets/")[1];
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

            if (arg.includes("//osu.ppy.sh/beatmaps/")) {
                let split = arg.split("beatmaps/")[1];
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

    console.log(id);

    if (id === undefined) {
        error = "invalid_url";
    }

    if (error === undefined && categories.length === 0) {
        error = "no_categorie";
    }

    console.log(id);

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

    let beatmap = await getBeatmap(id);

    let suggestion: suggestion = {
        beatmap: beatmap,
        mod_string: modstring,
        categories: categories
    }

    suggest(suggestion, message, prefix);
}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}