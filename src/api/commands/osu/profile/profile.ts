import { buildProfileEmbed } from "../../../../embeds/osu/profile/profile";
import { buildErrEmbed } from "../../../../embeds/osu/profile/error";
import User from "../../../../models/User";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { encrypt } from "../../../../utility/encrypt";
import { getUser, getUserByUsername } from "../../../osu/user";
import { checkIfUserIsLInked } from "../../../../embeds/utility/nouserfound";

export async function profile(message: any, args: any, mode: any) {

    let userid = null;
    let username = null;
    let userObject = null;
    let check_skills = false;
    let osu_user = null;

    message.channel.sendTyping();

    if (!args[0]) {
        userid = message.author.id
    }

    if (args[0] && args[0].startsWith("<@")) {
        userid = args[0].replace("<@", "").replace(">", "");
    }

    if (args.includes("-ts")) {
        check_skills = true;
    }

    if (userid === null) {
        username = buildUsernameOfArgs(args);
        osu_user = getUserByUsername(username, mode);
    } else {
        userObject = await User.findOne({ discordid: await encrypt(userid) });

        if (checkIfUserIsLInked(userObject, args[0], message)) {
            return;
        }

        osu_user = getUser(userObject!.userid, mode);
    }

    osu_user.then((data: any) => {

        if (check_skills) {
            // skills(message, userObject.userid, data);
            return;
        }

        try {
            buildProfileEmbed(data, message, mode)
        } catch (err) {
            buildErrEmbed(err, message);
            return;
        }
    })

}