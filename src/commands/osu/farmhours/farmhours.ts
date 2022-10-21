
import { ICommand } from "wokcommands";
import { farmgraph } from "../../../api/commands/osu/farm/farm";
import { helpFarmhours } from "../../../embeds/osu/farm/help";

export default {

    category: "osu!",
    aliases: ["fh"],
    description: "Quna check what hours you gained the most topplays",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpFarmhours(prefix);
            message.reply({ embeds: [embed] });
            return;
        }
        farmgraph(message, args, prefix, "hour");

    }
} as ICommand
