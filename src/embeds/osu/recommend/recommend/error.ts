import { MessageEmbed } from "discord.js";

export function queryError(message: any, error: any) {
    const errorEmbed = new MessageEmbed()
        .setTitle("Search Query Failure")
        .setColor(0x737df9)
        .setDescription(`There were issues generating your query.\nUse \`!showrec -h\` to get available parameters.\n\n Error:\n${error}`);
    message.reply({ embeds: [errorEmbed] });
}

export function noRecs(message: any, reply?: any) {

    const errorEmbed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle(`No recommendations`)
        .setDescription(`Quna currently has no personal recommendations for you.\n\nIf this is your first time requesting you might have to wait until the instance refreshes every xx:00/xx:30`)

    if (reply) {
        reply.edit({ embeds: [errorEmbed] });
    } else {
        message.reply({ embeds: [errorEmbed] });
    }

}

export function serverOffline(message: any, reply?: any) {

    const errorEmbed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle(`No recommendations`)
        .setDescription(`The Recommendation Server is currently offline please try again later.`)

    if (reply) {
        reply.edit({ embeds: [errorEmbed] });
    } else {
        message.reply({ embeds: [errorEmbed] });
    }

}