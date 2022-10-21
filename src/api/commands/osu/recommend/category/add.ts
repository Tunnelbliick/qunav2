import { buildArgslessEmbed } from "../../../../../commands/old_commands/embeds/arglessembed";
import Category from "../../../../../models/Category";
import { listCategories } from "./list";

const qunadevs = ["203932549746130944","181380205670170624"]

export async function addCategories(message: any, args: any) {

    if(!qunadevs.includes(message.author.id)) {
        message.reply("Only Quna developers are allowed to add Map categories.\nYou can suggest new categories on our discord.");
        return;
    }

    if(!args[0]) {
        buildArgslessEmbed(message)
        return;
    } 

    for(const arg of args) {
        const category = new Category();

        category.name = arg.toLowerCase();

        await category.save();
    }

    listCategories(message);

}