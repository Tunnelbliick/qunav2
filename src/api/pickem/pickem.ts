import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
const imageToBase64 = require('image-to-base64');
const DataImageAttachment = require("dataimageattachment");

export const current_tournament = "r8ll3trn";

export async function pickem(message: any, interaction: any, args: any) {

    let default_mode = "osu"

    let userid: any = undefined;
    let channel: any = undefined;

    if (interaction) {
        userid = interaction.user.id;
        channel = interaction.channel;
    } else {
        userid = message.author.id;
        channel = message.channel;
    }

    let owc_year: any = await owc.findOne({ url: current_tournament })
    let user: any = await User.findOne({ discordid: await encrypt(userid) });

    checkIfUserExists(user, message, interaction);

    let registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });


    let file = await imageToBase64(`assets/pickem/pickem_osu_2022.png`);
    let uri = "data:image/jpeg;base64," + file

    let register = new MessageButton()
        .setLabel("Register")
        .setStyle("SUCCESS")
        .setCustomId(`register_${userid}`)

    let predict = new MessageButton()
        .setLabel("Predict")
        .setStyle("PRIMARY")
        .setCustomId(`predict_${userid}`)

    let predictions = new MessageButton()
        .setLabel("Your Predictions")
        .setStyle("SECONDARY")
        .setCustomId(`predictions${userid}`)

    let row = new MessageActionRow().addComponents([register, predict, predictions]);

    let embed = new MessageEmbed()
        .setTitle("Quna OWC 2022 Pick'em Challenge")
        .setColor("#4b67ba")
        .setDescription(
            "Welcome to the Pick'em Challege.\n\n" +
            "**__Rewards__**\n" +
            "<:gold:1028355775350964328> **3 months supporter** + **custom card title**\n" +
            "<:silver:1028355773660676146> **2 months supporter**\n" +
            "<:bronze:1028355772079407188> **1 month supporter**\n\n" +
            `You are currently ${registration === null ? "**not registered**" : "**registered**"} for the Pick'em Challenge!\n` +
            `${registration === null ? "**Please register with the button below.**" : ""}`)
        .setImage("attachment://pickem.png");

    if (interaction) {
        await interaction.editReply({ embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "pickem.png")] });
    } else {
        await message.reply({ embeds: [embed], components: [row], files: [new DataImageAttachment(uri, "pickem.png")] });
    }

    return;
}