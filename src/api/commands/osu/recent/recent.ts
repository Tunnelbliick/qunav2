import { checkIfUserExists } from "../../../../embeds/utility/nouserfound";
import { generateRecentEmbed } from "../../../../embeds/osu/recent/recent";
import { buildErrEmbed } from "../../../../embeds/osu/recent/error";
import { RecentPlayFilter } from "../../../../models/RecentPlayFilter";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { getRecentPlaysForUser, getRecentPlaysForUserName } from "../../../osu/recent";
import { builFilter, optionsToFilter } from "./filter";
import { saveScore } from "../../../unranked/scoreSubmittion";

export async function recent(message: any, interaction: any, args: any, mode: any) {

    const arg_index = 0;
    const default_mode = mode;
    let stored = false;

    let filter: RecentPlayFilter;
    
    if (interaction !== undefined) {
        filter = optionsToFilter(interaction, default_mode);
    } else {
        filter = builFilter(message, args, default_mode)
    }

    let result: any;

    if (filter.username !== "") {
        result = await getRecentPlaysForUserName(filter.username, filter, filter.mode);
    } else {
        const userObject: any = await User.findOne({ discordid: await encrypt(filter.discordid) });
        if (checkIfUserExists(userObject, message)) {
            return;
        }

        result = await getRecentPlaysForUser(`${userObject.userid}`, filter, filter.mode);
    }

    if(result !== undefined && result.beatmap !== undefined && ["loved","ranked","qualified","Approved"].includes(result.beatmap.status) === false && result.recentplay.rank !== "F") {

        const max_pp = result.acc100.pp[100];
        stored = true;

        saveScore(result.recentplay, result.ppOfPlay, max_pp);
    }

    try {
        generateRecentEmbed(result, interaction, message, stored);
    } catch (err) {
        buildErrEmbed(err, message);
        return;
    }

    return;

}