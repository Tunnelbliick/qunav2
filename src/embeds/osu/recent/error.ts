import { Message, MessageEmbed } from "discord.js";

export function buildErrEmbed(err: any, message: Message){            
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle("Error located.")
        .setDescription("something broke, blame aru")
        console.log(err)
    message.channel.send({embeds: [embed]})
}

export function buildAPIErrEmbed(message: Message){            
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle("Something went wrong.")
        .setDescription("Blame osu api.")
    message.channel.send({embeds: [embed]})
}