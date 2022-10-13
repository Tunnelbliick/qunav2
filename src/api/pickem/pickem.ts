import { MessageEmbed } from "discord.js";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
const imageToBase64 = require('image-to-base64');
const DataImageAttachment = require("dataimageattachment");

export async function pickem(message: any, interaction: any, args: any) {

    let default_mode = "osu"
    let current_tournament = "r8ll3trn";

    let userid: any = undefined;

    if (interaction) {
        userid = interaction.user.id;
    } else {
        userid = message.author.id;
    }

    let owc_year: any = await owc.findOne({ url: current_tournament })
    let user: any = await User.findOne({ discordid: await encrypt(userid) });

    checkIfUserExists(user, message, interaction);

    let registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });


    if (registration == null) {

        let file = await imageToBase64(`assets/pickem/pickem_osu_2022.png`);
        let uri = "data:image/jpeg;base64," + file

        let embed = new MessageEmbed()
            .setTitle("Quna OWC 2022 Pick'em Challenge")
            .setColor("#4b67ba")
            .setDescription(
                "Welcome to the Pick'em Challege.\n\n" +
                "**__Rewards__**\n" +
                "<:gold:1028355775350964328> **3 months supporter** + **custom card title**\n" +
                "<:silver:1028355773660676146> **2 months supporter**\n" +
                "<:bronze:1028355772079407188> **1 month supporter**\n\n" +
                "You are currently **not registered** for the Pick'em Challenge!\n" +
                "**Please register with the button below.**")
            .setImage("attachment://pickem.png")

        if (interaction) {
            await interaction.editReply({ embeds: [embed], files: [new DataImageAttachment(uri, "pickem.png")] });
        } else {
            await message.reply({ embeds: [embed], files: [new DataImageAttachment(uri, "pickem.png")] });
        }

        return;

    }

    let select: any[] = [1];

    switch (owc_year.current_round) {
        case 1:
            select = [1];
            break;
        case 2:
            select = [2, "-1"];
            break;
        case 3:
            select = [3, "-2", "-3"];
            break;
        case 4:
            select = [4, "-4", "-5"];
            break;
        case 5:
            select = [5, "-6", "-7"];
            break;
        case 6:
            select = [6, "-8"];
    }

    let matches: any = await owcgame.find({ owc: owc_year.id, state: "open", round: { $in: select } });
}