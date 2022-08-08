import { ICommand } from "wokcommands";
import { top } from "../../../api/commands/osu/top/top";
export default {

    category: "osu!",
    aliases: ["t", "osutop"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        top(message, args, "osu");
    }
} as ICommand
