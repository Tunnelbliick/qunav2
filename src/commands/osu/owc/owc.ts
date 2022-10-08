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
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                { name: "2019", value: "2019", },
                { name: "2020", value: "2020", },
                { name: "2021", value: "2021", },]
        },
        /*{
            name: 'Country',
            description: 'Country to take a closer look at',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            autocomplete: true,
        },*/
    ],

    callback: async ({ message, interaction, args, prefix,  }) => {

        interaction_thinking(interaction);
        message_thinking(message);

        await getInfo(message, interaction, args);

    }

} as ICommand
