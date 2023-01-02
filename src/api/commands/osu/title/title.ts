import { stillProcessing } from "../../../../embeds/osu/card/error";
import { checkIfUserExists, checkIfUserIsLInked } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { encrypt } from "../../../../utility/encrypt";
import { getTopForUser } from "../../../osu/top";
import { getUser, getUserByUsername } from "../../../osu/user";
import { getAllSkills } from "../../../skills/skills";
import { getTitle } from "../../../osu/utility/title";
import { MessageEmbed } from "discord.js";
import { replaceFirstDots } from "../../../../utility/comma";

export async function title(message: any, args: any) {

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

    const top_100: any = await getTopForUser(osu_user.id);

    const skills: any = await getAllSkills(top_100);

    if (skills === undefined) {
        stillProcessing(message);
        return;
    }

    const title = getTitle(skills);

    let global_rank = osu_user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = osu_user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    const embed = new MessageEmbed()
    .setColor(0x737df9)
    .setAuthor({ name: `${osu_user.username} - ${osu_user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${osu_user.country_code}${country_rank})`, iconURL: `${osu_user.avatar_url}`, url: `https://osu.ppy.sh/users/${osu_user.id}` })
    .setDescription(`Title: **${title.title}**`)
    .setFooter({text:"Beta command! Only supports std atm."})

    await message.reply({ embeds: [embed] });
}