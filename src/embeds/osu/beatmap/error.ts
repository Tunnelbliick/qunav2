import { Message, MessageEmbed } from "discord.js"

export function fetchBeatmapError(message: Message) {
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setDescription("Error 727: Beatmap not found in previous 50 messages.")
    message.channel.send({ embeds: [embed] })
}

export function buildErrEmbed(err: any, message: Message){            
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle("Error located.")
        .setDescription("something broke, blame aru")
        console.log(err)
    message.channel.send({embeds: [embed]})
}