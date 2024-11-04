import { stillProcessing } from "../../../../embeds/osu/card/error";
import { checkIfUserExists, checkIfUserIsLInked } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { encrypt } from "../../../../utility/encrypt";
import { generateCard } from "../../../card/card";
import { getTopForUser } from "../../../osu/top";
import { getUser, getUserByUsername } from "../../../osu/user";
import { getAllSkills } from "../../../skills/skills";
import { getTitle } from "../../../osu/utility/title";
import { Title } from "../../../../interfaces/title";
const DataImageAttachment = require("dataimageattachment");

export async function card(message: any, args: any) {

    let userid = null;
    let username = null;
    let userObject = null;
    let tag: any = undefined;
    let osu_user: any = null;

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
        osu_user = await getUserByUsername(username, null);
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

    if (osu_user.playmode !== "osu")
        osu_user = await getUser(osu_user.id, osu_user.playmode);
        
    const top_100: any = await getTopForUser(osu_user.id);

    const skills: any = await getAllSkills(top_100);

    if (skills === undefined) {
        stillProcessing(message);
        return;
    }

    const title: Title = getTitle(skills);

    let secondaryTitle: Title | undefined = {
        title: "",
        colors: ["#737df9", "#abb1fb"]
    }

    switch (osu_user.id) {
        case 7737096:
        case 13424448:
            secondaryTitle = {
                title: "Quna Developer",
                colors: ["#737df9", "#abb1fb"]
            }
            break;
        case 6795168:
            secondaryTitle = {
                title: "1st Pick'em Winner",
                colors: ["#ac6a9b", "#e9d497"]
            }
            break;
    case 7206818:
            secondaryTitle = {
                title: "2nd Pick'em Winner",
                colors: ["#ac6a9b", "#e9d497"]
            }
            break;
        default:
            secondaryTitle = undefined;
    }

    const card = await generateCard(osu_user, skills, title, secondaryTitle);

    await message.reply({ files: [new DataImageAttachment(card, `${osu_user.username}_card.png`)] });
}