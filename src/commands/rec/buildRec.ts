import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { like } from "../../interfaces/Like";
import RecLike from "../../models/RecLike";
const Procyon = require('procyon')

export default {

    category: "osu!",
    slash: true,
    aliases: "build",
    description: "Quna loads your topplay",


    callback: async ({ interaction, message, args, prefix }) => {

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const likes: like[] = await RecLike.find();

        const top = new Procyon({
            className: 'top'
        })

        const pinned = new Procyon({
            className: 'pinned'
        })

        const favorite = new Procyon({
            className: 'favorite'
        })

        const all = new Procyon({
            className: 'all'
        })

        let index = 0;

        for (let like of likes) {

            index++;

            switch (like.origin) {
                case "top":
                    await top.liked(like.osuid, like.value);
                    break;
                case "pinned":
                    await pinned.liked(like.osuid, like.value);
                    break;
                case "favorite":
                    await favorite.liked(like.osuid, like.value);
                    break;
            }

            await all.liked(like.osuid, like.value);

            console.log(`${index}/${likes.length}`)

        }

        const embed = new MessageEmbed()
            .setTitle("Done!")
            .setDescription("Done")

        await interaction.editReply({ embeds: [embed] });
    }

} as ICommand
