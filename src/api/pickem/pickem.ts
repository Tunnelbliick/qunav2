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
export const last_tournament = "OWC22";

export async function pickem(message: any, interaction: any, args: any) {

    let userid: any = undefined;

    if (interaction) {
        userid = interaction.user.id;
    } else {
        userid = message.author.id;
    }

    const owc_year: any = await owc.findOne({ url: current_tournament });

    if(owc_year === null) {
        await noPickEm(message, interaction);
        return;
    }

    const file = await imageToBase64(`assets/pickem/pickem_osu_2022.png`);
    const uri = "data:image/png;base64," + file

    const register = new MessageButton()
        .setLabel("Register")
        .setStyle("SUCCESS")
        .setCustomId(`register_${userid}`)

    const predict = new MessageButton()
        .setLabel("Pick")
        .setStyle("PRIMARY")
        .setCustomId(`predict_${userid}`)

    const predictions = new MessageButton()
        .setLabel("Predictions")
        .setStyle("SECONDARY")
        .setCustomId(`predictions_${userid}`)

    const leaderboard = new MessageButton()
        .setLabel("Leaderboard")
        .setStyle("SECONDARY")
        .setCustomId(`leaderboard_${userid}`)

    const row = new MessageActionRow().addComponents([register, predict, predictions, leaderboard]);

    const embed = new MessageEmbed()
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