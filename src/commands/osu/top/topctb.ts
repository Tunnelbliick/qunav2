import { ICommand } from "wokcommands";
import { top } from "../../../api/commands/osu/top/top";
export default {

    category: "osu!",
    aliases: ["ctbtop", "ctbt", "catchtop", "topcatch"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        top(message, args, "fruits");
    }
} as ICommand
