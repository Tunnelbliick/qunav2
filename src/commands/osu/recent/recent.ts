import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, TextChannel, User } from "discord.js";
import { CommandObject, CommandType } from "wokcommands";
import { profile } from "../../../api/osu/profile/profile";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { recent } from "../../../api/osu/recent/recentHandler";


type CallbackParams = {
    channel: TextChannel;
    user: User;
    message: Message;
    interaction: ChatInputCommandInteraction;
    args: string[];
};

export default {
    type: CommandType.BOTH,

    description: "Look up a osu! Profile",
    aliases: ["o", "isu"],
    testOnly: false,
    guildOnly: false,
    ownerOnly: false,

    options: [
        {
            name: 'username',
            description: 'Look for a specific username',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'userid',
            description: 'Look for a specific userid',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'discord',
            description: 'Look for a specific user via mention',
            required: false,
            type: ApplicationCommandOptionType.User,
        },
        {
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: ApplicationCommandOptionType.String,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "ctb", value: "fruits", }, { name: "mania", value: "mania" }]
        },
        {
            name: 'query',
            description: 'Filter for a specific map e.g "Kira Kira"',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'rank',
            description: 'Filter for plays that acchived a certain rank',
            required: false,
            type: ApplicationCommandOptionType.String,
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
            type: ApplicationCommandOptionType.Number,
        },
        {
            name: 'fails',
            description: 'Include failed plays',
            required: false,
            type: ApplicationCommandOptionType.Boolean,
        },
        {
            name: 'server',
            description: 'Which server to lookup the user on',
            required: false,
            type: ApplicationCommandOptionType.String,
            choices: [{ name: "Bancho", value: "BANCHO", }, { name: "Akatsuki", value: "AKATSUKI", }, { name: "Gatari", value: "GATARI", }]
        },
    ],

    callback: ({ channel, user, message, interaction, args }: CallbackParams) => {
        recent(channel, user, message, interaction, args, Gamemode.OSU);
    },
    
} as CommandObject;
