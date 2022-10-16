import { ICommand } from "wokcommands";
import { interaction_silent_thinking, interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { pickem } from "../../../api/pickem/pickem";
import { predict } from "../../../api/pickem/predict";
export default {

    category: "osu!",
    slash: true,
    description: "Make predictions for the current round of the Pick'em",
    options: [

    ],
    callback: async ({ interaction, }) => {

        await interaction_silent_thinking(interaction);
        await predict(interaction);

    }

} as ICommand