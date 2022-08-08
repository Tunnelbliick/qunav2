import { ICommand } from "wokcommands";
import { MessageAttachment } from "discord.js";

export default {

    category: 'Fun',
    description: 'Graphic design is my passion.',

    callback: ({ message }) => {
        const gfxPic = new MessageAttachment('https://cdn.discordapp.com/attachments/907830378193092669/953636084351373352/e44.png')
        message.channel.send({files: [gfxPic]})
    }

} as ICommand