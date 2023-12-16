import { ICommand } from "wokcommands";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { interaction_thinking, message_thinking } from "../../../../embeds/utility/thinking";
import { recalc } from "../../../../api/pickem/recalc";
import { MessageEmbed } from "discord.js";

export default {

    category: "osu!",
    slash: "both",
    description: "Get osu! world cup results for a specific year",
    testOnly: true,
    callback: async ({ message, interaction, args, prefix, client }) => {

        const default_mode = "osu"

        await interaction_thinking(interaction);
        message_thinking(message);

        if (interaction && interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
        }

        if (message && message.author.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await message.reply({ embeds: [embed] });
        }

        await recalc();

        const embed = new MessageEmbed()
        .setTitle("Done!")
        .setDescription("Done");

        if (message && message.author.id !== "203932549746130944") {
            await message.reply({ embeds: [embed] });
        }
    if (interaction && interaction.user.id !== "203932549746130944") {
        await interaction.editReply({ embeds: [embed] });
    }

    }

} as ICommand