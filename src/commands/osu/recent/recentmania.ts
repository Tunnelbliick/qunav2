import { ICommand } from "wokcommands";
import { recent } from "../../../api/commands/osu/recent/recent";
import { helpRecent } from "../../../embeds/osu/recent/help";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default {

    category: "osu!",
    aliases: ["maniar", "maniars", "rm"],
    slash: "both",
    options: [
        {
            name: 'username',
            description: 'Look for a specific username',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'discord',
            description: 'Look for a specific user via mention',
            required: false,
            type: ApplicationCommandOptionTypes.USER,
        },
        {
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "ctb", value: "ctb", }, { name: "mania", value: "mania" }]
        },
        {
            name: 'query',
            description: 'Filter for a specific map e.g "Kira Kira"',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'rank',
            description: 'Filter for plays that acchived a certain rank',
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
            choices: [
                { name: "SS", value: "S", },
                { name: "S", value: "S", },
                { name: "A", value: "A", },
                { name: "B", value: "B", },
                { name: "C", value: "C", },
                { name: "D", value: "D", },
                { name: "F", value: "F", }]
        },
        {
            name: 'index',
            description: 'Select a specific recent play based on the index',
            required: false,
            type: ApplicationCommandOptionTypes.NUMBER,
        },
        {
            name: 'fails',
            description: 'Include failed plays',
            required: false,
            type: ApplicationCommandOptionTypes.NUMBER,
            choices: [{ name: "True", value: 1, }, { name: "False", value: 0, }]
        },
    ],
    description: "Quna grabs your last score.",

    callback: async ({ message, args, prefix, interaction }) => {

        await interaction_thinking(interaction);
        message_thinking(message);

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpRecent(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await recent(message, interaction, args, "mania");

    }

} as ICommand