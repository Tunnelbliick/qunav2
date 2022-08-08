import { ICommand } from "wokcommands";
import { MessageEmbed } from "discord.js";
import { buildArgslessEmbed } from "./embeds/arglessembed";
import { buildErrEmbed } from "./embeds/errorEmbed";
import axios from 'axios';

export default {

    category: 'Fun',
    description: "Quna guesses your gender!",

    callback: ({ message, args }) => {

        if(!args[0]){
            buildArgslessEmbed(message)
        }

        else{
        axios.get(`https://api.genderize.io/?name=${args[0]}`)
        .then((res: any) => {
            const gender = res.data.gender
            const percent = Math.round(res.data.probability * 100)

            if(!gender){
                const embed = new MessageEmbed()
                    .setColor(0x737df9)
                    .setDescription(`I have no idea what the gender of ${args[0]} is.`)
                    message.channel.send({ embeds: [embed] })
            }

            else{
            const embed = new MessageEmbed()
                .setColor(0x737df9)
                .setDescription(`I'm ` + percent + `% sure ${args[0]} is a ` + gender + ` name!`)
                message.channel.send({ embeds: [embed] })
            }
        })
        .catch((err: any) => {
            buildErrEmbed(err, message)
        })
        }   
    },
} as ICommand