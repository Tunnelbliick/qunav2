import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { buildArgslessEmbed } from "./embeds/arglessembed";

export default{

    category: "Fun",
    description: "Let Quna pick from multiple options!",

    callback: ({ message, args, prefix }) => {

        /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpchoose(prefix);
            message.reply({ embeds: [embed] });
            return;
        }*/

        if(!args[0]){
            buildArgslessEmbed(message)
        }

        else{
            const embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`I think I'll choose ${args[Math.floor(Math.random() * args.length)]} this time!`);
            message.channel.send({embeds: [embed]})
        }
    },

}as ICommand