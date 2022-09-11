import { ICommand } from "wokcommands";
import { compare } from "../../../api/commands/osu/compare/compare";
import { helpcompare } from "../../../embeds/osu/compare/help";
import DiscordJS from 'discord.js'
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";

export default {

    category: "osu!",
    aliases: ["c"],
    slash: "both",
    options: [
        {
            name: 'username',
            description: 'Look for a specific username',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'discord',
            description: 'Look for a specific user via mention',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.USER,
        },
        {
            name: 'map',
            description: 'Link or ID of the map',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
    ],
    description: "Quna compares your score with recent or beatmap",

    callback: async ({ message, args, prefix, interaction }) => {

        interaction_thinking(interaction);
        message_thinking(message);

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpcompare(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await compare(message, interaction, args);

    }

} as ICommand


