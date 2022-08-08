
import { fetchBeatmapError } from "../../../../embeds/osu/beatmap/error";
import { generateCompareEmbed } from "../../../../embeds/osu/compare/compare";
import { buildErrEmbed, noPlayFoundEmbed } from "../../../../embeds/osu/compare/error";
import { checkIfUserIsLInked, noUserFound } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { getScoresForBeatMap, getScoresForUsernameForBeatMap } from "../../../osu/score";

export async function compare(message: any, args: any) {

    message.channel.sendTyping();

    let url = "";
    let id = "";
    let userid = undefined;
    let username = "";
    let user: any;
    let first = true;
    let tag;

    /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
        let embed = helpcompare(prefix);
        message.reply({ embeds: [embed] });
        return;
    } */

    if (message.reference != null) {
        let reference_id: any = message.reference?.messageId;
        let reference_message = await message.channel.messages.fetch(reference_id);
        let embed = reference_message.embeds[0];
        url = embed.url;
    }

    if (!args[0]) {
        userid = message.author.id
    }

    for (let arg of args) {

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

    // If no beatmap is in String
    if (url == "") {
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
    }

    if (url.includes("//osu.ppy.sh/beatmapsets/")) {
        let split = url.split("beatmapsets/")[1];
        let para = split.split("/");

        if (para.length == 2) {
            id = sanitize(para[1]);
        }
    }
    if (url.includes("//osu.ppy.sh/beatmaps/")) {
        let split = url.split("beatmaps/")[1];
        id = sanitize(split);
    }
    if (!id) {
        fetchBeatmapError(message);
        return;
    }

    let response: any
    if (userid !== undefined) {

        let userObject: any = await User.findOne({ discordid: await encrypt(userid) });

        if (checkIfUserIsLInked(userObject, tag, message)) {
            return;
        }

        response = await getScoresForBeatMap(id, userObject!.userid);

        if (response.scores == undefined) {
            noPlayFoundEmbed(response.user, message)
            return;
        }
    } else {
        response = await getScoresForUsernameForBeatMap(id, username);

        if (response.user === undefined) {
            noUserFound(message);
            return;
        }

        if (response.scores === undefined) {
            noPlayFoundEmbed(response.user, message)
            return;
        }
    }

    user = response.user;
    let map = response.beatmap;

    let scoreList: Array<any> = [];

    response.scores.forEach((score: any) => {
        scoreList.push(score.value);
    })
    try {
        generateCompareEmbed(map, user, scoreList, message);
    } catch (err) {
        buildErrEmbed(err, message);
        return;
    }
}

function sanitize(inp: string): string {
    return inp.replace(/[^0-9.]/g, '');
}

