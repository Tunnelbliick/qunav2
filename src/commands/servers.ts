import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {

    category: "osu!",
    slash: "both",
    description: "Information about Quna",
    hidden: true,

    callback: async ({ message, client, prefix, interaction }) => {

        let isSlash = true;

        if (message != null && message.content.startsWith(prefix)) {
            isSlash = false;
        }

        let servcer_count = client.guilds.cache.size;

        const embed = new MessageEmbed()
            .setTitle("Quna server check")
            .setDescription(`Quna is currently in ${servcer_count} servers.`)
            .setColor(0x737df9)


        if (isSlash) {
            interaction.reply({ embeds: [embed] });
        } else {
            message.reply({ embeds: [embed] });
        }
        return;
    }

} as ICommand

