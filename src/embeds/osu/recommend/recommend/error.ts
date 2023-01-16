import { MessageEmbed } from "discord.js";

export function queryError(message: any, error: any) {
    const errorEmbed = new MessageEmbed()
        .setTitle("Search Query Failure")
        .setColor(0x737df9)
        .setDescription(`There were issues generating your query.\nUse \`!showrec -h\` to get available parameters.\n\n Error:\n${error}`);
    message.reply({ embeds: [errorEmbed] });
}

export function noRecs(message: any) {

    const errorEmbed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle(`No recommendations`)
        .setDescription(`Quna currently has no personal recommendations for you.`)

    message.reply({ embeds: [errorEmbed] });


}