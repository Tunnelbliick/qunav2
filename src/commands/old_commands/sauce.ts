import { ICommand } from "wokcommands";
import sagiri from "sagiri";
import { MessageEmbed } from "discord.js";
import { buildErrEmbed } from "./embeds/errorEmbed";
const sauce = sagiri(`${process.env.saucenao}`, { results: 1 });

export default {

    category: "Art",
    description: "Quna tries to find a source for your image!",

    callback: ({ message }) => {

        message.attachments.forEach(attachment => {
            sauce(attachment.proxyURL).then((response:any) => {
                const data = response[0]

                const embed = new MessageEmbed()
                .setColor(0x737df9)
                .setTitle("Sauce found!")
                .addFields([
                    {
                        name: 'Similarity',
                        value: data.similarity + `%`,
                        inline: true
                    },
                    {
                        name: 'Author',
                        value: `${data.authorName}`,
                        inline: true
                    },
                    {
                        name: 'Website',
                        value: `${data.site}`,
                        inline: true
                    },
                    {
                        name: 'URL',
                        value: `${data.url}`,
                        inline: false
                    },
                ])
                .setImage(data.thumbnail)
                message.channel.send({embeds: [embed]})
            })
            .catch((err: any) => {
                buildErrEmbed(err, message)
            })
        })

    }

} as ICommand