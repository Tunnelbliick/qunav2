import { ICommand } from "wokcommands";
import { buildErrEmbed } from "../../../embeds/osu/recent/error";
import { recent } from "../../../api/commands/osu/recent/recent";

export default {

    category: "osu!",
    aliases: ["taikor", "taikors"],
    description: "Quna grabs your last replay.",

    callback: async ({ message, args, prefix }) => {

        await recent(message, args, "taiko");

    }

} as ICommand