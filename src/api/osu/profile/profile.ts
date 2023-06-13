import { Interaction, Message } from "discord.js";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { QunaUser } from "../../../interfaces/qunaUser";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";

interface profileArguments {
    userid: string,
    username: string,
    userObject: QunaUser,
    check_skills: boolean,
    osu_user: OsuUser
}

export async function profile(message: Message, args: string[], mode: Gamemode) {

    message.channel.sendTyping();

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

function handleProfileParameters(args: string[], interaction: Interaction): profileArguments {

    
    /*if (!args[0]) {
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
    }*/


    return undefined;
}