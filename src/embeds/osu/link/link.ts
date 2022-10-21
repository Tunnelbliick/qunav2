import { MessageEmbed } from "discord.js";
import User from "../../../models/User";

export function generateAuthEmbed(dm: string) {

    const embed = new MessageEmbed()
        .setAuthor({name: "Account Link", iconURL: "https://cdn.discordapp.com/emojis/950784507353628723.webp"})
        .setColor("#4b67ba")
        .setDescription(`[Click here](${dm}) to connect your osu! profile`)
        .setFooter({ text: 'Contact Tunnelblick if the authentication process runs into any issues' })

    return embed;
}

export async function timeoutAuthEmbed() {
    const embed = new MessageEmbed()
        .setTitle("Failure.")
        .setDescription("You did not connect your profile in time! Please try again!")
        .setColor("#ff3333")

    return embed;
}

export async function successfullAuthEmbed(username: String) {
    const embed = new MessageEmbed()
        .setTitle("Success!")
        .setDescription(`Accounts connected!\nUsername: ${username}`)
        .setColor("#6aa84f")

    return embed;
}

export async function checkforLinkSucess(discordid: string) {
    const userObject: any = await User.findOne({ discordid: discordid });
    return new Promise((resolve, reject) => {
        if (userObject.linksucess) {
            resolve(userObject.username);

        } else {
            reject(false);
        }
    })

}