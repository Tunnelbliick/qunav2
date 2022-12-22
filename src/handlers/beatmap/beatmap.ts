import { Client, Permissions } from "discord.js"
import { mods } from "osu-api-extended"
import { getBeatmap, getBeatmapSet } from "../../api/osu/beatmap"
import { buildMapEmbed } from "../../embeds/osu/beatmap/beatmap"
const { v2 } = require("osu-api-extended")

export default (client: Client) => {

    client.on("messageCreate", async message => {

        if (message.content.startsWith("https://osu.ppy.sh/beatmaps")) {

            const url = message.content;

            let id = message.content;
            let setid: string = "";

            let isSet = false;

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
                const para = split.split("/");
                id = sanitize(para[0]);
                isSet = false;
                if (para.length > 1) {
                    return;
                }
            }


            if (isSet == true)
                await getBeatmapSet(parseInt(setid)).then((data: any) => {
                    id = data.beatmaps[data.beatmaps.length - 1].id;
                });

            await getBeatmap(id).then((data: any) => {

                buildMapEmbed(data, message, null, "");

            })


        }
    })
}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}