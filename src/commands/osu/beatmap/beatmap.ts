import { ICommand } from "wokcommands";
import { beatmap } from "../../../api/commands/osu/beatmap/beatmap";

export default {

    category: "osu!",
    aliases: ["m", "map"],
    description: "Quna grabs a map or something.",

    callback: async ({ message, args, prefix }) => {


       /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpmap(prefix);
            message.reply({ embeds: [embed] });
            return;
        }*/

        await beatmap(message, args);

    }

} as ICommand
