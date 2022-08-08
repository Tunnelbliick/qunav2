import { Message, MessageEmbed } from "discord.js";

export function buildArgslessEmbed(message: Message){            
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setDescription("ok thats cool and all but where is the thing i'm supposed to look at")
    message.channel.send({embeds: [embed]})
}