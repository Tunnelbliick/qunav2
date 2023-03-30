import { ICommand } from "wokcommands";
import { compare } from "../../../api/commands/osu/compare/compare";
import { helpcompare } from "../../../embeds/osu/compare/help";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default {

    category: "osu!",
    aliases: ["c"],
    slash: "both",
    options: [
        {
            name: 'username',
            description: 'Look for a specific username',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'discord',
            description: 'Look for a specific user via mention',
            required: false,
            type: ApplicationCommandOptionTypes.USER,
        },
        {
            name: 'map',
            description: 'Link or ID of the map',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },
    ],
    description: "Quna compares your score with recent or beatmap",

    callback: async ({ message, args, prefix, interaction }) => {

        await interaction_thinking(interaction);
        message_thinking(message);

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpcompare(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await compare(message, interaction, args);

    }

} as ICommand


