
import { fetchBeatmapError } from "../../../../embeds/osu/beatmap/error";
import { generateCompareEmbed } from "../../../../embeds/osu/compare/compare";
import { buildErrEmbed, noPlayFoundEmbed } from "../../../../embeds/osu/compare/error";
import { checkIfUserIsLInked, noUserFound } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { getScoresForBeatMap, getScoresForUsernameForBeatMap } from "../../../osu/score";
import { checkForBeatmap } from "../../../utility/checkForBeatmap";

export async function compare(message: any, interaction: any, args: any) {

    let url = "";
    let id = "";
    let userid = undefined;
    let username = "";
    let user: any;
    let first = true;
    let tag;

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

        userid = options.getMember("discord") === null ? interaction.user.id : options.getMember("discord")?.toString()!;
        username = options.getString("username") === null ? "" : options.getString("username")!;

        if (userid) {
            userid = userid.replace("<@", "").replace(">", "");
        }

    }

    const beatmapCheck = await checkForBeatmap(message, interaction, args);

    id = beatmapCheck?.id;

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

