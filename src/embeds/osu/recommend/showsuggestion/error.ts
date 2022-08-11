import { MessageEmbed } from "discord.js";

export function queryError(message: any, error: any) {
    let errorEmbed = new MessageEmbed()
        .setTitle("Search Query Failure")
        .setColor(0x737df9)
        .setDescription(`There were issues generating your query.\nUse \`!showrec -h\` to get available parameters.\n\n Error:\n${error}`);
    message.reply({ embeds: [errorEmbed] });
} 