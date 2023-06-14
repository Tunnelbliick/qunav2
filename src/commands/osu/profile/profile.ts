import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, TextChannel, User } from "discord.js";
import { CommandObject, CommandType } from "wokcommands";
import WOKCommands from "wokcommands";
import { profile } from "../../../api/osu/profile/profile";
import { Gamemode } from "../../../interfaces/enum/gamemodes";

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
  aliases: ["profile", "o", "osu", "p", "isu"],
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
      name: 'skills',
      description: 'Check the skills for a specific user',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    },
    {
      name: 'mode',
      description: 'Gamemode to lookup',
      required: false,
      type: ApplicationCommandOptionType.String,
      choices: [{ name: "osu", value: "OSU", }, { name: "taiko", value: "TAIKO", }, { name: "ctb", value: "CTB", }, { name: "mania", value: "MANIA" }]
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
    profile(channel, user, message, interaction, args, Gamemode.OSU);
  },
} as CommandObject;
