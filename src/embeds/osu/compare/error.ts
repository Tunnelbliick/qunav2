import { Message, MessageEmbed } from "discord.js";

export function noPlayFoundEmbed(user: any, message: Message) {
    let embed = new MessageEmbed()
    .setColor(0x737df9)
    .setDescription(`${user.username} has no scores on this beatmap!`)
    message.reply({embeds: [embed]});
}


export function buildErrEmbed(err: any, message: Message){            
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle("Error located.")
        .setDescription("something broke, blame aru")
        console.log(err)
    message.channel.send({embeds: [embed]})
}

