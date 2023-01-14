import asyncBatch from "async-batch";
import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { interaction_silent_thinking } from "../../embeds/utility/thinking";
import { like } from "../../interfaces/Like";
import { QunaUser } from "../../interfaces/QunaUser";
import RecLike from "../../models/RecLike";
import User from "../../models/User";
import UserHash from "../../models/UserHash";
const Procyon = require("procyon");

export default {

    category: "osu!",
    slash: true,
    aliases: "build",
    description: "Quna loads your topplay",


    callback: async ({ interaction, message, args, prefix }) => {

        await interaction_silent_thinking(interaction);

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        // const users: QunaUser[] = await User.find();
        const likeAggregation: any[] = await RecLike.aggregate([
            {
                "$match": {
                    origin: "top",
                    mode: "osu"
                }
            },
            {
                "$group": {
                    "_id": "$value",
                    "count": { "$sum": 1 }
                }
            }]);
        const userHash: any[] = await UserHash.find();
        const likes: like[] = await RecLike.find({ origin: "top", mode: "osu" });

        var startTime = performance.now()

        const all = new Procyon({
            className: 'top_osu'
        })

        let index = 0;

        for (let like of likes) {
            index++;

            await all.liked(like.osuid, like.value, { updateRecs: false });
            if (index % 100 == 0)
                console.log(`${index}/${likes.length}`)

        }

        index = 0;
        for (let like of likeAggregation) {
            await new Promise(async (resolve) => {
                all.updateWilsonScore(like._id, () => {
                    if (index % 1000 == 0)
                        console.log(`updateWilsonScore ${index}/${userHash.length}`)
                    return resolve(true);
                });
            });
        }

        const continueFrom = userHash;
        index = 0;
        for (let user of continueFrom) {
            index++;
            await new Promise(async (resolve) => {
                all.updateSimilarityFor(user.osuid, () => {
                    if (index % 100 == 0)
                        console.log(`updateSimilarityFor ${index}/${userHash.length}`)
                    return resolve(true);
                });
            });
        }

        index = 0;
        for (let user of userHash) {
            index++;
            await new Promise(async (resolve) => {
                all.updateRecommendationsFor(user.osuid, () => {
                    if (index % 100 == 0)
                        console.log(`updateRecommendationsFor ${index}/${userHash.length}`)
                    return resolve(true);
                });
            });
        }

        console.log(await all.recommendFor("7737096", 100));

        var endTime = performance.now()
        console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)

        /*await asyncBatch(likes,
            (like: like, taskIndex: number) => new Promise(
                async (resolve) => {
                    await all.liked(like.osuid, like.value, {updateRecs: false});
                    if(taskIndex % 100 == 0)
                    console.log(`${taskIndex}/${likes.length}`)
                    return resolve(true);
                }
            ),
            1000,
        );
     
        await asyncBatch(likes,
            (like: like, taskIndex: number) => new Promise(
                async (resolve) => {
                    await all.updateSequence(like.osuid, like.value);
                    if(taskIndex % 100 == 0)
                    console.log(`${taskIndex}/${likes.length}`)
                    return resolve(true);
                }
            ),
            50,
        );
     
     
        /*likes.forEach(async (like) => {
     
          /switch (like.origin) {
                case "top":
                    await top.updateSequence(like.osuid, like.value);
                    break;
                case "pinned":
                    await pinned.updateSequence(like.osuid, like.value);
                    break;
                case "favorite":
                    await favorite.updateSequence(like.osuid, like.value);
                    break;
            }
     
            await all.updateSequence(like.osuid, like.value);
            /*for(let user of users) {
     
                const userid: number = +user.userid;
     
                await top.liked(userid, "UPDATE");
                await pinned.liked(userid, "UPDATE");
                await favorite.liked(userid, "UPDATE");
                await all.liked(userid, "UPDATE");
     
                await top.unliked(userid, "UPDATE");
                await pinned.unliked(userid, "UPDATE");
                await favorite.unliked(userid, "UPDATE");
                await all.unliked(userid, "UPDATE");
     
            }
            console.log(`Updating ${index++}/${likes.length}`)
        });*/

        const embed = new MessageEmbed()
            .setTitle("Done!")
            .setDescription("Done")

        await interaction.editReply({ embeds: [embed] });
    }

} as ICommand
