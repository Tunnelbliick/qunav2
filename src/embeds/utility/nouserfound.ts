import { Message, MessageEmbed } from "discord.js";

export function checkIfUserExists(userObject: any, message: Message) {
    if (userObject == null || userObject.userid == null) {
        let embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`No account linked to this User.\nPlease link your account with /link`)
        message.reply({ embeds: [embed] });
        return true;
    } else {
        false;
    }
}

export function checkIfUserIsLInked(userObject: any, tag: any, message: Message) {
    if (userObject == null || userObject.userid == null) {

        let embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`${tag} has no Profile linked`)

        message.reply({ embeds: [embed] });
        return true;
    } else {
        false;
    }
}

export function noUserFound(message: Message) {
    let embed = new MessageEmbed()
        .setColor(0x737df9)
        .setDescription(`No user was found with this name`)

    message.reply({ embeds: [embed] });
}