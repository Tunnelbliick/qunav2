import { Message } from "discord.js";
import { stillProcessing } from "../../../../embeds/osu/skill/error";
import { generateSkillsEmbed } from "../../../../embeds/osu/skill/skill";
import { checkIfUserExists, checkIfUserIsLInked, noUserFound } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { encrypt } from "../../../../utility/encrypt";
import { getTopForUser } from "../../../osu/top";
import { getUser, getUserByUsername } from "../../../osu/user";
import { getAllSkills } from "../../../skills/skills";

export async function skill(message: any, args: any) {

    let userid = null;
    let username = null;
    let userObject = null;
    let tag: any = undefined;
    let osu_user: any = null;
    let mode = "osu"

    message.channel.sendTyping();

    if (!args[0]) {
        userid = message.author.id
    }

    if (args[0] && args[0].startsWith("<@")) {
        tag = args[0];
        userid = args[0].replace("<@", "").replace(">", "");
    }

    if (userid === null) {
        username = buildUsernameOfArgs(args);
        osu_user = await getUserByUsername(username, undefined);
    } else {
        userObject = await User.findOne({ discordid: await encrypt(userid) });

        if (tag !== undefined && checkIfUserIsLInked(userObject, tag, message)) {
            return;
        }

        if (checkIfUserExists(userObject, message)) {
            return;
        }

        osu_user = await getUser(userObject!.userid, undefined);

    }

    if(!osu_user) {
        noUserFound(message);
        return;
    }

    mode = osu_user.playmode!

    const top_100: any = await getTopForUser(osu_user.id, undefined, undefined, mode);

    const skills: any = await getAllSkills(top_100);

    if(skills === undefined) {
        stillProcessing(message);
        return;
    }

    generateSkillsEmbed(skills, osu_user, message);

}