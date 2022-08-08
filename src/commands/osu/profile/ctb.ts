import { ICommand } from "wokcommands";
import { profile } from "../../../api/commands/osu/profile/profile";

export default {

    category: "osu!",
    aliases: ["catch", "pcatch", "profilecatch", "catchprofile"],
    description: "Quna grabs your osu! profile.",

    callback: async ({ message, args, prefix }) => {

        /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "h" || args[0] == "help") {
             let embed = helposu(prefix);
             message.reply({ embeds: [embed] });
             return;
         }*/

        let mode: any = "fruits"

         await profile(message, args, mode);
    }

} as ICommand
