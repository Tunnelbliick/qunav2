import { ICommand } from "wokcommands";
import { showsuggestions } from "../../../../api/commands/osu/recommend/showsuggestions/showsuggestions";
import { suggestion } from "../../../../api/commands/osu/recommend/suggest/suggest";

export default {

    category: "osu!",
    aliases: ["ss", "showsugs", "shows", "showsug", "suggestions"],

    description: "Quna grabs your osu! profile.",

    callback: async ({ message, args, prefix }) => {

        /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "h" || args[0] == "help") {
             let embed = helposu(prefix);
             message.reply({ embeds: [embed] });
             return;
         }*/

        await showsuggestions(message, args, prefix);
    }

} as ICommand
