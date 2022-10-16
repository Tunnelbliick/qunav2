import { ICommand } from "wokcommands";
import { leaderboard } from "../../../api/pickem/leaderboard";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";

export default {

    category: "osu!",
    slash: "both",
    description: "Make predictions for the current round of the Pick'em",
    options: [

    ],
    callback: async ({ message, interaction, args }) => {

        await interaction_thinking(interaction);
        message_thinking(message);

        await leaderboard(message,interaction);

    }

} as ICommand