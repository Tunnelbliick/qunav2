import { ICommand } from "wokcommands";
import { beatmap } from "../../../api/commands/osu/beatmap/beatmap";
import { helpmap } from "../../../embeds/osu/beatmap/help";
import DiscordJS from 'discord.js'
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default {

    category: "osu!",
    aliases: ["m", "beatmap"],
    slash: "both",
    options: [
        {
            name: 'map',
            description: 'Link or ID of the map',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'mods',
            description: 'Mods for the Beatmap e.g. hrhd',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        }
    ],
    description: "Quna grabs a map or something.",

    callback: async ({ message, args, prefix, interaction }) => {

        await interaction_thinking(interaction);
        message_thinking(message);

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpmap(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await beatmap(message, interaction, args);

    }

} as ICommand
