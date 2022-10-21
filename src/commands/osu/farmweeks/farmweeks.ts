
import { ICommand } from "wokcommands";
import { farmgraph } from "../../../api/commands/osu/farm/farm";
import { helpFramWeeks } from "../../../embeds/osu/farm/help";

export default {

    category: "osu!",
    aliases: ["fw"],
    description: "Quna check what hours you gained the most topplays",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpFramWeeks(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        farmgraph(message, args, prefix, "week");

    }
} as ICommand
