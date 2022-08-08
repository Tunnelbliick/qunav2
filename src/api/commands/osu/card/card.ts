import { checkIfUserExists, checkIfUserIsLInked } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { encrypt } from "../../../../utility/encrypt";
import { generateCard } from "../../../card/card";
import { getTopForUser } from "../../../osu/top";
import { getUser, getUserByUsername } from "../../../osu/user";
import { generateskills } from "../../../skills/skills";
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
        osu_user = getUserByUsername(username, undefined);
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

    let top_100 = await getTopForUser(osu_user.id);

    let skills: any = await generateskills(top_100);

    let card = await generateCard(osu_user, skills);

    await message.reply({ files: [new DataImageAttachment(card, `${osu_user.username}_card.png`)] });
}