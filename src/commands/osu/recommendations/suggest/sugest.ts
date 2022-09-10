import { ICommand } from "wokcommands";
import { suggestion } from "../../../../api/commands/osu/recommend/suggest/suggest";
import { helpsuggest } from "../../../../embeds/osu/recommend/suggest/help";

export default {

    category: "osu!",
    aliases: ["sug", "suggestion", "s"],

    description: "Quna grabs your osu! profile.",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "h" || args[0] == "help") {
            let embed = helpsuggest(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await suggestion(message, args, prefix);
    }

} as ICommand
