import { ICommand } from "wokcommands";
import { recentbest } from "../../../api/commands/osu/recentbest/recentbest";
import { helprecentBest } from "../../../embeds/osu/recentbest/help";
export default {

    category: "osu!",
    aliases: ["maniarb"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helprecentBest(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        recentbest(message, args, "mania");
    }
} as ICommand
