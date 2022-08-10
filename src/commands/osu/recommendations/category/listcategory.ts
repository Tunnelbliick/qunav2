import { ICommand } from "wokcommands";
import { listCategories } from "../../../../api/commands/osu/recommend/category/list";

export default {

    category: "osu!",
    aliases: ["lc", "category", "categories"],
    description: `Add a Type for beatmap recommendation`,

    callback: async ({ message, args }) => {

        listCategories(message);

    }
} as ICommand