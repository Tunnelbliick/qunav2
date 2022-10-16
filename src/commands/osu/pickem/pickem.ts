import { ICommand } from "wokcommands";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { pickem } from "../../../api/pickem/pickem";
export default {

    category: "osu!",
    slash: "both",
    description: "Current Pickem!",
    options: [

    ],
    callback: async ({ message, interaction, args, prefix, client }) => {
        await interaction_thinking(interaction);
        message_thinking(message);

        await pickem(message, interaction, args);


    }

} as ICommand