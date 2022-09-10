
import { ICommand } from "wokcommands";
import { farmgraph } from "../../../api/commands/osu/farm/farm";
import { helpFarmMonth } from "../../../embeds/osu/farm/help";

export default {

    category: "osu!",
    aliases: ["fm"],
    description: "Quna check what hours you gained the most topplays",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpFarmMonth(prefix);
            message.reply({ embeds: [embed] });
            return;
        }
        farmgraph(message, args, prefix, "month");

    }
} as ICommand
