import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { buildArgslessEmbed } from "./embeds/arglessembed";

export default{

    category: 'Fun',
    aliases: ['waifu', 'rate'],
    description: 'Quna will rate a name you give her!',

    callback: ({ message, args,prefix }) => {

       /* if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpwaifu(prefix);
            message.reply({ embeds: [embed] });
            return;
        }*/
        
        if(!args[0]){
            buildArgslessEmbed(message)
        }

        else{
            const embed = new MessageEmbed()
            .setColor(0x737df9)
            .setDescription(`I'd give ${args.join(" ")} a ${Math.floor(Math.random() * 10) + 1}/10!`)
            message.channel.send({ embeds: [embed]})
        }
    },
} as ICommand