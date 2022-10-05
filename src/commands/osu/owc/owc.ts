import { ICommand } from "wokcommands";
import { profile } from "../../../api/commands/osu/profile/profile";
import DiscordJS from 'discord.js';
import { getInfo } from "../../../api/owc/owc";

export default {

    category: "osu!",
    slash: "both",
    description: "Get Owc results for a sepcific year",
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
        {
            name: 'Country',
            description: 'Country to take a closer look at',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
    ],

    callback: async ({ message, interaction, args, prefix }) => {

        await getInfo(message, interaction, args);

    }

} as ICommand
