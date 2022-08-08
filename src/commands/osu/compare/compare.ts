import { ICommand } from "wokcommands";
import { compare } from "../../../api/commands/osu/compare/compare";


export default {

    category: "osu!",
    aliases: ["c"],
    description: "Quna compares your score with !r or !m",

    callback: async ({ message, args, prefix }) => {

        await compare(message, args);

    }

} as ICommand


