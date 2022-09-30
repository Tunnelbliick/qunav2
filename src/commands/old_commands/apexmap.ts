import { ICommand } from "wokcommands";
import { MessageEmbed } from "discord.js";
import axios from 'axios';
import { buildErrEmbed } from "./embeds/errorEmbed";

export default {

    category: 'APIs',
    aliases: ['apex'],
    description: "Quna's Map Rotation showcase!",

    callback: ({ message, args, prefix }) => {

        // place api in dotenv
        axios.get(`https://api.mozambiquehe.re/maprotation?version=2&auth=${process.env.apexapi}`)
            .then((res: any) => {

                // converting mins into hours
                const mapDuration = res.data.battle_royale.next.DurationInMinutes
                var mapHours = mapDuration / 60
                const mapMins = mapDuration % 60

                if (mapHours == 1.5) {
                    mapHours = 1
                }

                // we love kings canyon
                let kcCheck = "#ApexLedgends"
                if (res.data.battle_royale.current.map == "Storm Point" || res.data.battle_royale.next.map == "Storm Point") {
                    kcCheck = "fuck."
                }

                // create embed here
                const embed = new MessageEmbed()
                    .setColor(0x737df9)
                    .setTitle("Quna's Apex Legends Map Rotation Show!")
                    .setFooter({ text: `${kcCheck}` })
                    .addFields([
                        {
                            name: "🗺️ Current Map",
                            value: `${res.data.battle_royale.current.map}`,
                            inline: true
                        },
                        {
                            name: "⏲️ Time Remaining",
                            value: `${res.data.battle_royale.current.remainingTimer}`,
                            inline: true
                        },
                        {
                            name: "᲼᲼᲼᲼᲼᲼",
                            value: "᲼᲼᲼᲼᲼᲼",
                            inline: false
                        },
                        {
                            name: "🗺️ Next Map",
                            value: `${res.data.battle_royale.next.map}`,
                            inline: true
                        },
                        {
                            name: "⏲️ Map Duration",
                            value: `${mapHours} hour(s) ${mapMins} minutes`,
                            inline: true
                        },
                    ])
                    .setImage(`${res.data.battle_royale.current.asset}`)
                message.channel.send({ embeds: [embed] })
            })
            .catch((err: any) => {
                buildErrEmbed(err, message)
            })
    },
} as ICommand