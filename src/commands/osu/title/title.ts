import { ICommand } from "wokcommands";
import { title } from "../../../api/commands/osu/title/title";


export default {

    category: "osu!",
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        message.channel.sendTyping();

        title(message, args);

        }
    } as ICommand