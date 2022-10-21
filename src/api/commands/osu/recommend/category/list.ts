import { MessageEmbed } from "discord.js";
import Category from "../../../../../models/Category";

export async function listCategories(message: any) {

    const categories: any = await Category.find();
    let categories_string = "";

    categories.forEach((value: any, index: any) => {
        categories_string += `${index + 1} - \`${value.name}\`\n`;
    });

    const categories_embed = new MessageEmbed()
        .setTitle(`Available Categories`)
        .setDescription(`${categories_string}`)

    message.reply({ embeds: [categories_embed] });

}