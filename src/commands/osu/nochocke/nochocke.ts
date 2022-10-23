import { ICommand } from "wokcommands";
import { helpTop } from "../../../embeds/osu/top/help";
import DiscordJS from 'discord.js';
import { nochocke } from "../../../api/commands/osu/nochocke/nochocke";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";

export default {

    category: "osu!",
    aliases: ["nc"],
    slash: "both",
    description: "Quna loads your topplay",
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
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "catch", value: "ctb", }, { name: "mania", value: "mania" }]
        },
        {
            name: 'search',
            description: 'Filter for a specific map e.g "Kira Kira"',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'mods',
            description: 'Filter for a specific mods e.g "HR HD"',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'accuracy',
            description: 'Filter for accuracy acchived e.g " <99 | >99 | 100 | 99-100 "',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'combo',
            description: 'Filter for combo acchived e.g " <1000 | >300 | 250 | 100-450 "',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'rank',
            description: 'Filter for plays that acchived a certain rank',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                { name: "SS", value: "X", },
                { name: "S", value: "S", },
                { name: "A", value: "A", },
                { name: "B", value: "B", },
                { name: "C", value: "C", },
                { name: "D", value: "D", },
                { name: "F", value: "F", }]
        },
        {
            name: 'sort',
            description: 'different ways to sort',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                { name: "Accuracy", value: "acc", },
                { name: "Combo", value: "combo", },
                { name: "Length", value: "length", },
            ]
        },
        {
            name: 'reverse',
            description: 'Reverse the result',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN,
        }
    ],


    callback: async ({ interaction, message, args, prefix }) => {

        await interaction_thinking(interaction);
        await message_thinking(message);

        nochocke(interaction, message, args, "osu");
    }
} as ICommand
