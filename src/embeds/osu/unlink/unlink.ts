import { MessageEmbed } from "discord.js";

export async function successfullUnlink() {
    let embed = new MessageEmbed()
        .setTitle("Success!")
        .setDescription(`Your Account has been unlinked.\nYour data has been deleted.`)
        .setColor("#6aa84f")

    return embed;
}