import { ICommand } from "wokcommands";
import { skill } from "../../../api/commands/osu/skill/skill";
import { helpskills } from "../../../embeds/osu/skill/help";


export default {

    category: "osu!",
    aliases: ["topskills", "skills"],
    description: "Quna loads your topplay",


    callback: async ({ message, args, prefix }) => {

        message.channel.sendTyping();

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpskills(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        skill(message, args);

        }
    } as ICommand
