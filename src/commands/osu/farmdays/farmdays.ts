
import { ICommand } from "wokcommands";
import { farmgraph } from "../../../api/commands/osu/farm/farm";
import { helpFarmdays } from "../../../embeds/osu/farm/help";

export default {

    category: "osu!",
    aliases: ["fd"],
    description: "Quna check what hours you gained the most topplays",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpFarmdays(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        farmgraph(message, args, prefix, "day");

    }
} as ICommand
