import { ICommand } from "wokcommands";
import DiscordJS from 'discord.js';
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { compareworldcups } from "../../../api/owc/compare";

export default {

    category: "osu!",
    slash: "both",
    aliases: ["worldcupcompare", "wccompare", "worldcupcompare", "owcc", "mwcc", "twcc", "mwcc"],
    description: "Compare world cup results",
    options: [
        {
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "catch", value: "catch", }, { name: "mania", value: "mania" }]
        },
    ],

    callback: async ({ message, interaction, args, prefix, }) => {

        await interaction_thinking(interaction);
        message_thinking(message);

        await compareworldcups(message, interaction, args, undefined);

    }

} as ICommand
