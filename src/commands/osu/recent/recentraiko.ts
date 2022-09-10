import { ICommand } from "wokcommands";
import { buildErrEmbed } from "../../../embeds/osu/recent/error";
import { recent } from "../../../api/commands/osu/recent/recent";
import { helpRecent } from "../../../embeds/osu/recent/help";

export default {

    category: "osu!",
    aliases: ["taikor", "taikors"],
    description: "Quna grabs your last replay.",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpRecent(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await recent(message, args, "taiko");

    }

} as ICommand