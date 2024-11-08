import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import PerformancePoints from "../models/PerformancePoints";
import asyncBatch from "async-batch";
import { recalculateBeatMap } from "../api/pp/db/loadmap";

export default {

    category: "osu!",
    slash: "both",
    description: "Information about Quna",
    hidden: true,

    callback: async ({ message, client, prefix, interaction }) => {

        let userid: any = 0;

        if(interaction) {
            userid = interaction.user.id;
        } else {
            userid = message.author.id;
        }

        if(userid !== "203932549746130944") {
            return
        }

        const ppObject: any = await PerformancePoints.find({mode:3});

        const race = asyncBatch(ppObject,
            (pp: any) => new Promise(
                async (resolve) => {

                    recalculateBeatMap(pp).then((re: any) => {
                        console.log(`Update ${pp.mapid} ${pp.mods}`)
                        return resolve(true)
                    });

                }
            ),
            2,
        );

    }

} as ICommand

