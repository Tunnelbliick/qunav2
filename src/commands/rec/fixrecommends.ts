import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { fixrecommends } from "../../api/commands/osu/recommend/recommend/recommend";

export default {

    category: "osu!",
    slash: "both",
    description: "Quna loads your topplay",


    callback: async ({ interaction, message, args, prefix }) => {

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
            return;
        }


       await fixrecommends();

        const embed = new MessageEmbed()
            .setTitle("Done!")
            .setDescription("Done")

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand
