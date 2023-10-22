import { MessageEmbed } from "discord.js";
import { last_tournament } from "../../../api/pickem/pickem";
import owc from "../../../models/owc";
import pickemRegistration from "../../../models/pickemRegistration";
import User from "../../../models/User";
const imageToBase64 = require('image-to-base64');
const DataImageAttachment = require("dataimageattachment");

export async function noPickEm(message: any, interaction: any) {

    const owc_year: any = await owc.findOne({ url: last_tournament });
    const top_20: any = await pickemRegistration.find({ owc: owc_year.id }).sort({ total_score: -1 }).limit(10).exec();
    const top_20_userids = top_20.map((top: any) => top.user.toString());
    const users: any = await User.find({ _id: { $in: top_20_userids } });

    const usermap: Map<any, any> = new Map<any, any>();

    users.forEach((user: any) => {
        usermap.set(user.id, user);
    })

    let first_score = 0;
    let first: string[] = [];
    let second_score = 0;
    let second: string[]= [];
    let third_score = 0;
    let third: string[] = [];

    const file = await imageToBase64(`assets/pickem/pickem23.png`);
    const uri = "data:image/png;base64," + file

    top_20.forEach((top: any) => {

        const current_user = usermap.get(top.user.toString());
        
        if(first_score < top.total_score) {
            first = [];
            first_score = top.total_score;
            first.push(`[${current_user.username}](https://osu.ppy.sh/users/${current_user.userid})`);
        } else if(first_score == top.total_score) {
            first.push(`[${current_user.username}](https://osu.ppy.sh/users/${current_user.userid})`);
        } else if(second_score < top.total_score) {
            second = [];
            second_score = top.total_score;
            second.push(`[${current_user.username}](https://osu.ppy.sh/users/${current_user.userid})`);
        } else if(second_score == top.total_score) {
            second.push(`[${current_user.username}](https://osu.ppy.sh/users/${current_user.userid})`);
        } else if(third_score < top.total_score) {
            third = [];
            third_score = top.total_score;
            third.push(`[${current_user.username}](https://osu.ppy.sh/users/${current_user.userid})`);
        } else if(third_score == top.total_score) {
            third.push(`[${current_user.username}](https://osu.ppy.sh/users/${current_user.userid})`);
        }

    })

    const embed = new MessageEmbed()
        .setTitle(`Quna ${owc_year.name} Pick'em Challenge`)
        .setColor("#4b67ba")
        .setDescription(
            "**__Winners__**\n" +
        `<:gold:1028355775350964328> **${first.join(" ")}**\n` +
            `<:silver:1028355773660676146> **${second.join(" ")}**\n` +
            `<:bronze:1028355772079407188> **${third.join(" ")}**\n\n` +
            `**Thanks everyone for participating.**`)
        .setImage("attachment://pickem.png");

    if(interaction) {
        interaction.editReply({embeds: [embed], files: [new DataImageAttachment(uri, "pickem.png")] });
    } else {
        message.reply({embeds: [embed], files: [new DataImageAttachment(uri, "pickem.png")] });
    }

    return;
}