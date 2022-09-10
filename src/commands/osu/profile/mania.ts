import { ICommand } from "wokcommands";
import { profile } from "../../../api/commands/osu/profile/profile";
import { helpprofile } from "../../../embeds/osu/profile/help";

export default {

    category: "osu!",
    aliases: ["pmania", "profilemania", "maniaprofile"],
    description: "Quna grabs your osu! profile.",

    callback: async ({ message, args, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpprofile(prefix);
            message.reply({ embeds: [embed] });
            return;
        }
        let mode: any = "mania"

        await profile(message, args, mode);
    }

} as ICommand
