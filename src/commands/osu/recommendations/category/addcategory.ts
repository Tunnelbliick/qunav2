import { ICommand } from "wokcommands";
import { addCategories } from "../../../../api/commands/osu/recommend/category/add";

export default {

    category: "osu!",
    aliases: ["ac", "addc"],
    description: `Add a Type for beatmap recommendation`,

    callback: async ({ message, args }) => {

        addCategories(message, args);

    }
} as ICommand