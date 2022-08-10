import { Message, MessageEmbed } from "discord.js"

export function stillProcessing(message: Message){            
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle("Wait a second please")
        .setDescription("Your Topplays are still beeing processed.\nPlease try again in a few seconds.")
    message.channel.send({embeds: [embed]})
}