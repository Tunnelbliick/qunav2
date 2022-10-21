import { ICommand } from "wokcommands";
import { top } from "../../../api/commands/osu/top/top";
import { helpTop } from "../../../embeds/osu/top/help";
export default {

    category: "osu!",
    aliases: ["ctbtop", "ctbt", "catchtop", "topcatch"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpTop(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        top(message, args, "fruits");
    }
} as ICommand
