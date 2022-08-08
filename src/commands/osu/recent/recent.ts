import { ICommand } from "wokcommands";
import { recent } from "../../../api/commands/osu/recent/recent";

export default {

    category: "osu!",
    aliases: ["r", "rs"],
    description: "Quna grabs your last replay.",

    callback: async ({ message, args, prefix }) => {

        await recent(message, args, "osu");

    }

} as ICommand