export async function checkForBeatmap(message: any, interaction: any, args: any) {
    let url = "";
    let id = undefined
    let mods = "";
    let setid = "";
    let isSet = false;

    // Check if this is a response to an embed
    if (message && message.reference != null) {
        const reference_id: any = message.reference?.messageId;
        const reference_message = await message.channel.messages.fetch(reference_id);
        const embed = reference_message.embeds[0];
        url = embed.url;
    }

    // Check if this is an interaction with a map option
    if (interaction) {

        const options = interaction.options;

        url = options.getString("map") === null ? "" : options.getString("map")!;

    // Check if this is a command with a map url or id as payload
    } else {

        for (const arg of args) {
            if (arg.includes("osu.ppy.sh/beatmapsets/") || arg.includes("osu.ppy.sh/beatmaps/") || arg.includes("osu.ppy.sh/b/") || arg.includes("osu.ppy.sh/s/") || isNaN(arg) === false) {
                url = arg;
                id = arg;
            } else {
                mods = arg;
            }
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
                    if (embed.url != null && (embed.url?.includes("osu.ppy.sh/beatmapsets/") || embed.url?.includes("osu.ppy.sh/beatmaps/") || embed.url?.includes("osu.ppy.sh/b/") || embed.url?.includes("osu.ppy.sh/s/"))) {
                        url = embed.url;
                    }
                    if (url != "") {
                        break;
                    }
                }
            });
        })
    }

    if (url.includes("/beatmapsets/") || url.includes("/s/")) {
        const split = url.split("s/")[1];
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

    if (url.includes("/beatmaps/") || url.includes("/b/")) {
        const split = url.split("/");
        id = sanitize(split[split.length - 1]);
        isSet = false;
    }

    return { id, setid, isSet, mods };
}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}