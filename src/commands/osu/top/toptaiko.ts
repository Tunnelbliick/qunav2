import { ICommand } from "wokcommands";
import { top } from "../../../api/commands/osu/top/top";
export default {

    category: "osu!",
    aliases: ["taikot", "taikotop"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        top(message, args, "taiko");
    }
} as ICommand
