import { ICommand } from "wokcommands";
import { card } from "../../../api/commands/osu/card/card";

export default {

    category: "osu!",
    aliases: ["card"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        message.channel.sendTyping();

        /*if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
                let embed = helpcard(prefix);
                message.reply({ embeds: [embed] });
                return;
            }*/

        await card(message, args);

    }
    
} as ICommand
