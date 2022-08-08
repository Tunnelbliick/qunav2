import { checkIfUserExists } from "../../../../embeds/utility/nouserfound";
import { generateRecentEmbed } from "../../../../embeds/osu/recent/recent";
import { buildErrEmbed } from "../../../../embeds/osu/recent/error";
import { RecentPlayFilter } from "../../../../models/RecentPlayFilter";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { getRecentPlaysForUser, getRecentPlaysForUserName } from "../../../osu/recent";
import { builFilter } from "./filter";

export async function recent(message: any, args: any, mode: any) {

    let arg_index = 0;
    let default_mode = mode;

    /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "h" || args[0] == "help") {
        let embed = recentHelp(prefix);
        message.reply({ embeds: [embed] });
        return;
    }*/

    let filter: RecentPlayFilter = builFilter(message, args, default_mode)

    let result: any;

    if (filter.username !== "") {
        result = await getRecentPlaysForUserName(filter.username, filter, filter.mode);
    } else {
        let userObject: any = await User.findOne({ discordid: await encrypt(filter.discordid) });
        if (checkIfUserExists(userObject, message)) {
            return;
        }

        result = await getRecentPlaysForUser(`${userObject.userid}`, filter, filter.mode);
    }

    try {
        generateRecentEmbed(result, message);
    } catch (err) {
        buildErrEmbed(err, message);
        return;
    }

    return;

}