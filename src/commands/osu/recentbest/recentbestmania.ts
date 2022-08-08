import { ICommand } from "wokcommands";
import { recentbest } from "../../../api/commands/osu/recentbest/recentbest";
export default {

    category: "osu!",
    aliases: ["maniarb"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        recentbest(message, args, "mania");
    }
} as ICommand
