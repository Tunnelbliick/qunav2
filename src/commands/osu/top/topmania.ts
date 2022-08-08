import { ICommand } from "wokcommands";
import { top } from "../../../api/commands/osu/top/top";
export default {

    category: "osu!",
    aliases: ["maniat", "maniatop"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        top(message, args, "mania");
    }
} as ICommand
