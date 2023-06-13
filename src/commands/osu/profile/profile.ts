import { Client, Interaction, Message } from "discord.js";
import { CommandObject, CommandType } from "wokcommands";
import WOKCommands from "wokcommands";

type CallbackParams = {
  message: Message;
  interaction: Interaction;
  args: string[];
};

export default {
  type: CommandType.BOTH,
  init: (client: Client, instance: WOKCommands) => { },

  description: "Look up a osu! Profile",
  aliases: [],
  testOnly: false,
  guildOnly: false,
  ownerOnly: false,

  callback: ({ message, interaction, args }: CallbackParams) => {
    message.reply("yup works");
  },
} as CommandObject;
