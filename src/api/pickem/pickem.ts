import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
const imageToBase64 = require('image-to-base64');
const DataImageAttachment = require("dataimageattachment");

export const current_tournament = "OWC22";

export async function pickem(message: any, interaction: any, args: any) {

    let userid: any = undefined;

    if (interaction) {
        userid = interaction.user.id;
    } else {
        userid = message.author.id;
    }

    let owc_year: any = await owc.findOne({ url: current_tournament });

    if(owc_year === null) {
        await noPickEm(message, interaction);
        return;
    }

    let file = await imageToBase64(`assets/pickem/pickem_osu_2022.png`);
    let uri = "data:image/png;base64," + file

    let register = new MessageButton()
        .setLabel("Register")
        .setStyle("SUCCESS")
        .setCustomId(`register_${userid}`)

    let predict = new MessageButton()
        .setLabel("Pick")
        .setStyle("PRIMARY")
        .setCustomId(`predict_${userid}`)

    let predictions = new MessageButton()
        .setLabel("Predictions")
        .setStyle("SECONDARY")
        .setCustomId(`predictions_${userid}`)

    let leaderboard = new MessageButton()
        .setLabel("Leaderboard")
        .setStyle("SECONDARY")
        .setCustomId(`leaderboard_${userid}`)

    let row = new MessageActionRow().addComponents([register, predict, predictions, leaderboard]);

    let embed = new MessageEmbed()
        .setTitle("Quna OWC 2022 Pick'em Challenge")
        .setColor("#4b67ba")
        .setDescription(
            "Welcome to the Pick'em Challenge.\n\n" +
            "**__Rewards__**\n" +
            "<:gold:1028355775350964328> **12 months supporter** + **custom card title**\n" +
            "<:silver:1028355773660676146> **6 months supporter**\n" +
            "<:bronze:1028355772079407188> **4 months supporter**\n\n" +
            `**Please register with the button below.**`)
        .setImage("attachment://pickem.png");

    if (interaction) {
        await interaction.editReply({ embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "pickem.png")] });
    } else {
        await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "pickem.png")] });
    }

    return;
}