import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {

    category: "osu!",
    aliases: ["info", "i"],
    description: "Information about Quna",

    callback: async ({ message, args, prefix }) => {

        let embed = new MessageEmbed()
            .setTitle("Quna information")
            .setDescription(
                "**Yet another multipurpose (but mainly focused on osu!) Discord bot recode version 2.**\n\n" +
                "If you have any issues, suggestions or questions join our discord! \n\n" +
                "[Discord](https://discord.gg/azPWUfSMm3)\n" +
                "[GitHub](https://github.com/Tunnelbliick/qunav2)")
            .setColor(0x737df9)


        message.reply({ embeds: [embed] });
        return;
    }

} as ICommand

