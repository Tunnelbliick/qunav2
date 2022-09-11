import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {

    category: "osu!",
    aliases: ["info", "i"],
    slash: "both",
    description: "Information about Quna",

    callback: async ({ message, args, prefix, interaction }) => {

        let isSlash = true;

        if (message != null && message.content.startsWith(prefix)) {
            isSlash = false;
        }

        let embed = new MessageEmbed()
            .setTitle("Quna information")
            .setDescription(
                "**Yet another multipurpose (but mainly focused on osu!) Discord bot recode version 2.**\n\n" +
                "If you have any issues, suggestions or questions join our discord! \n\n" +
                "[Privacy Policy](https://github.com/Tunnelbliick/qunav2/blob/master/PRIVACY.md)\n " +
                "[Discord](https://discord.gg/azPWUfSMm3)\n" +
                "[GitHub](https://github.com/Tunnelbliick/qunav2)")
            .setColor(0x737df9)


        if (isSlash) {
            interaction.reply({ embeds: [embed] });
        } else {
            message.reply({ embeds: [embed] });
        }
        return;
    }

} as ICommand

