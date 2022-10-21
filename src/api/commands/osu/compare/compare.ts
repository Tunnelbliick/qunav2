
import { fetchBeatmapError } from "../../../../embeds/osu/beatmap/error";
import { generateCompareEmbed } from "../../../../embeds/osu/compare/compare";
import { buildErrEmbed, noPlayFoundEmbed } from "../../../../embeds/osu/compare/error";
import { checkIfUserIsLInked, noUserFound } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { getScoresForBeatMap, getScoresForUsernameForBeatMap } from "../../../osu/score";

export async function compare(message: any, interaction: any, args: any) {

    let url = "";
    let id = "";
    let userid = undefined;
    let username = "";
    let user: any;
    let first = true;
    let tag;

    if (message && message.reference != null) {
        const reference_id: any = message.reference?.messageId;
        const reference_message = await message.channel.messages.fetch(reference_id);
        const embed = reference_message.embeds[0];
        url = embed.url;
    }

    if (message) {
        userid = message.author.id

        for (const arg of args) {

            // If Argument is tag
            if (arg.startsWith("<@")) {
                tag = arg;
                userid = arg.replace("<@", "").replace(">", "");

                // If Argument is map link
            } else if (arg.startsWith("http")) {

                url = arg;

                // else its the username
            } else {
                if (first) {
                    username += arg;
                    first = false
                } else
                    username += ` ${arg}`
            }
        }
    } else {

        const options = interaction.options;

        url = options.getString("map") === null ? "" : options.getString("map")!;
        userid = options.getMember("discord") === null ? interaction.user.id : options.getMember("discord")?.toString()!;
        username = options.getString("username") === null ? "" : options.getString("username")!;

        if (userid) {
            userid = userid.replace("<@", "").replace(">", "");
        }

    }

    // If no beatmap is in String
    if (url == "") {

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
    }
    if (url.includes("//osu.ppy.sh/beatmaps/")) {
        const split = url.split("beatmaps/")[1];
        id = sanitize(split);
    }
    if (!id) {
        fetchBeatmapError(message);
        return;
    }

    let response: any
    if (username !== "") {
        response = await getScoresForUsernameForBeatMap(id, username);

        if (response.user === undefined) {
            noUserFound(message);
            return;
        }

        if (response.scores === undefined) {
            noPlayFoundEmbed(response.user, message)
            return;
        }
    } else {

        const userObject: any = await User.findOne({ discordid: await encrypt(userid) });

        if (checkIfUserIsLInked(userObject, tag, message)) {
            return;
        }

        response = await getScoresForBeatMap(id, userObject!.userid);

        if (response.scores == undefined) {
            noPlayFoundEmbed(response.user, message)
            return;
        }
    }

    user = response.user;
    const map = response.beatmap;

    const scoreList: Array<any> = [];

    const top = response.top;
    const leaderboard = response.leaderboard;

    response.scores.forEach((score: any) => {
        scoreList.push(score.value);
    })
    try {
        generateCompareEmbed(map, user, scoreList, top, leaderboard, message, interaction);
    } catch (err) {
        buildErrEmbed(err, message);
        return;
    }
}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}

