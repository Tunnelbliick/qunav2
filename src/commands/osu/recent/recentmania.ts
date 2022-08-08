import { ICommand } from "wokcommands";
import { recent } from "../../../api/commands/osu/recent/recent";

export default {

    category: "osu!",
    aliases: ["maniar", "maniars"],
    description: "Quna grabs your last replay.",

    callback: async ({ message, args, prefix }) => {

        await recent(message, args, "mania");

    }

} as ICommand