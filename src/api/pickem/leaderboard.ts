import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import owc from "../../models/owc";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { current_tournament } from "./pickem";
const imageToBase64 = require('image-to-base64');
const DataImageAttachment = require("dataimageattachment");

export async function leaderboard(message: any, interaction: any) {

    let discordid: any = undefined;

    if (interaction) {
        discordid = interaction.user.id;
    } else {
        discordid = message.author.id;
    }

    const owc_year: any = await owc.findOne({ url: current_tournament });

    if (owc_year === null) {
        await noPickEm(message, interaction);
        return;
    }

    const user: any = await User.findOne({ discordid: await encrypt(discordid) });

    let user_position: any = undefined;
    let registration: any = undefined;

    if (user !== null)
        registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    if (registration !== undefined)
        user_position = await pickemRegistration.find({ owc: owc_year.id, user: { $ne: user.id }, total_score: { $gte: registration.total_score } }).sort({ total_score: -1 }).count().exec() + 1;
    const top_20: any = await pickemRegistration.find({ owc: owc_year.id }).sort({ total_score: -1 }).limit(10).exec();
    const top_20_userids = top_20.map((top: any) => top.user.toString());
    const users: any = await User.find({ _id: { $in: top_20_userids } });

    const usermap: Map<any, any> = new Map<any, any>();

    users.forEach((user: any) => {
        usermap.set(user.id, user);
    })

    let description: any = "```";

    let index = 1;

    top_20.forEach((top: any) => {
        const current_user = usermap.get(top.user.toString());
        let total_score = `${top.total_score}`;
        let index_string = `${index}`;

        switch (total_score.length) {
            case 1:
                total_score = total_score + "  ";
                break;
            case 2:
                total_score = total_score + " ";
                break;
        }

        switch (index_string.length) {
            case 1:
                index_string = index_string + " ";
                break;
        }

        description += `#${index_string} | ${total_score} | ${current_user.username}\n`
        index++;
    })

    if (registration !== undefined) {
        let total_score = `${registration.total_score}`;
        let index_string = `${user_position}`;

        switch (total_score.length) {
            case 1:
                total_score = total_score + "  ";
                break;
            case 2:
                total_score = total_score + " ";
                break;
        }

        switch (index_string.length) {
            case 1:
                index_string = index_string + " ";
                break;
        }

        description += "\n";
        description += `#${index_string} | ${total_score} | ${user.username}\n`
    }
    description += "```";

    const embed = new MessageEmbed()
        .setColor("#4b67ba")
        .setTitle(`Leaderboard pick'em ${owc_year.name}`)
        .setDescription(description)
        .setImage("attachment://pickem.png");

    const file = await imageToBase64(`assets/pickem/pickem23.png`);
    const uri = "data:image/png;base64," + file;

    if (interaction) {
        await interaction.editReply({ embeds: [embed], files: [new DataImageAttachment(uri, "pickem.png")] });
    } else {
        await message.reply({ embeds: [embed], files: [new DataImageAttachment(uri, "pickem.png")] });
    }



    return;
}