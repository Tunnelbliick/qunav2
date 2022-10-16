import { MessageEmbed } from "discord.js";

export function noPickEm(message: any, interaction: any) {

    let embed = new MessageEmbed()
        .setTitle("No Pick'em")
        .setDescription("Theres currently no Pickem going on.\nPlease come back later.")
        .setColor(0x737df9);

    if(interaction) {
        interaction.editReply({embeds: [embed]});
    } else {
        message.reply({embeds: [embed]});
    }

    return;
}