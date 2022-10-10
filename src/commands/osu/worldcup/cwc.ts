import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js';
import { getInfo } from "../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";

export default {

    category: "osu!",
    slash: "both",
    description: "Get Owc results for a specific year",
    options: [
        {
            name: 'year',
            description: 'Year to look at',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            autocomplete: true,
        },
        {
            name: 'Country',
            description: 'Country to take a closer look at',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            autocomplete: true,
        },
        {
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "catch", value: "catch", }, { name: "mania", value: "mania" }]
        },
    ],

    callback: async ({ message, interaction, args, prefix,  }) => {

        let default_mode = "catch"

        await interaction_thinking(interaction);
        message_thinking(message);

        await getInfo(message, interaction, args, default_mode);

    }

} as ICommand
