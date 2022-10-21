import { ICommand } from "wokcommands";
import { profile } from "../../../api/commands/osu/profile/profile";
import { helpprofile } from "../../../embeds/osu/profile/help";

export default {

    category: "osu!",
    aliases: ["profile", "o", "osu", "p", "isu"],
    
    description: "Quna grabs your osu! profile.",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpprofile(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        const mode: any = "osu"
        
        await profile(message, args, mode);
    }

} as ICommand
