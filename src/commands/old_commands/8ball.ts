import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { buildArgslessEmbed } from "./embeds/arglessembed";

const ans = require('../../../assets/8ball/8ball.json')

export default {

    category: 'Fun',
    description: 'Ask Quna and her magic 8-Ball about something!',

    callback: ({ message, args,prefix }) => {

        /*if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = help8ball(prefix);
            message.reply({ embeds: [embed] });
            return;
        }*/

        if(!args[0]){
            buildArgslessEmbed(message)
        }

        else{
            const embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`${ans[Math.floor(Math.random() * ans.length)]}`)
            message.channel.send({ embeds: [embed]})
        }
    },
} as ICommand