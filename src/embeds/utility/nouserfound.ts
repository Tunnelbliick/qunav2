import { Message, MessageEmbed } from "discord.js";

export function checkIfUserExists(userObject: any, message?: Message, interaction?: any) {
    if (userObject == null || userObject.userid == null) {
        const embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`No account linked to this User.\nPlease link your account with /link`)

        if (interaction !== undefined) {
            interaction.editReply({ embeds: [embed] });
        } else if(message !== undefined) {
            message.reply({ embeds: [embed] });
        }
        return true;
    } else {
        false;
    }
}

export function checkIfUserIsLInked(userObject: any, tag: any, message: Message) {
    if (userObject == null || userObject.userid == null) {

        const embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`${tag} has no Profile linked`)

        message.reply({ embeds: [embed] });
        return true;
    } else {
        false;
    }
}

export function noUserFound(message: Message) {
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setDescription(`No user was found with this name`)

    message.reply({ embeds: [embed] });
}