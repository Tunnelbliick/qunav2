import { ICommand } from "wokcommands";
import { compare } from "../../../api/commands/osu/compare/compare";
import { helpcompare } from "../../../embeds/osu/compare/help";


export default {

    category: "osu!",
    aliases: ["c"],
    description: "Quna compares your score with !r or !m",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpcompare(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        await compare(message, args);

    }

} as ICommand


