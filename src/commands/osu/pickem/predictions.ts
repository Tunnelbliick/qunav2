import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js';
import { predictions } from "../../../api/pickem/predictions";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
export default {

    category: "osu!",
    slash: "both",
    description: "Make predictions for the current round of the Pick'em",
    aliases: "predictions",
    options: [
        {
            name: 'discord',
            description: 'Predictions for a specific discord user',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.USER,
        },
        {
            name: 'name',
            description: 'Predictions for a specific username',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'test',
            description: 'Predictions for a specific username',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
    ],
    callback: async ({ message, interaction, args, prefix, }) => {

        await interaction_thinking(interaction);
        message_thinking(message);

        await predictions(message, interaction, args);

    }

} as ICommand