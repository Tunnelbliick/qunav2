import { ICommand } from "wokcommands";
import { getInfo } from "../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default {

    category: "osu!",
    slash: "both",
    description: "Get mania world cup results for a specific year",
    options: [
        {
            name: 'keys',
            description: 'Keys to look at',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
            choices: [
                { name: "4k", value: "4K"},
                { name: "7k", value: "7K"}
            ]
        },
        {
            name: 'year',
            description: 'Year to look at',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: true,
        },
        {
            name: 'Country',
            description: 'Country to take a closer look at',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: true,
        },
        {
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "catch", value: "catch", }, { name: "mania", value: "mania" }]
        },
    ],

    callback: async ({ message, interaction, args, prefix,  }) => {

        const default_mode = "mania";

        await interaction_thinking(interaction);
        message_thinking(message);

        await getInfo(message, interaction, args, default_mode);

    }

} as ICommand
