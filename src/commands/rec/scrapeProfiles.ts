import asyncBatch from "async-batch";
import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { getFavorite, getPinned, getTopForUser } from "../../api/osu/top";
import { like } from "../../interfaces/Like";
import { QunaUser } from "../../interfaces/QunaUser";
import RecLike from "../../models/RecLike";
import User from "../../models/User";

export default {

    category: "osu!",
    slash: true,
    aliases: "slash",
    description: "Quna loads your topplay",


    callback: async ({ interaction, message, args, prefix }) => {

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const quna_users: QunaUser[] = await User.find({});
        let index = 0;

        const race = asyncBatch(quna_users,
            user => new Promise(
                async (resolve) => {
                    index++;
                    if (user.userid != null || user.userid != undefined) {

                        const top: any = await getTopForUser(user.userid);
                        const pinned: any = await getPinned(user.userid);
                        const favorite: any = await getFavorite(user.userid);

                        if (top != "osuapierr") {

                            const userLikes: any[] = [];

                            top.forEach((play: any) => {
                                const usrLike: like = new RecLike();
                                usrLike.osuid = +user.userid;
                                usrLike.beatmapid = play.value.beatmap.id;
                                usrLike.origin = "top";
                                usrLike.value = `${play.value.beatmap.id}_${play.value.mods.join("")}`;
                                usrLike.mode = play.value.beatmap.mode
                                userLikes.push(usrLike);
                            })

                            RecLike.bulkSave(userLikes);
                        }

                        if (!pinned.hasOwnProperty("error")) {

                            const userLikes: any[] = [];

                            pinned.forEach((play: any) => {
                                const usrLike: like = new RecLike();
                                usrLike.osuid = +user.userid;
                                usrLike.beatmapid = play.beatmap.id;
                                usrLike.origin = "pinned";
                                usrLike.value = `${play.beatmap.id}_${play.mods.join("")}`;
                                usrLike.mode = play.beatmap.mode;
                                userLikes.push(usrLike);
                            })

                            RecLike.bulkSave(userLikes);
                        }

                        if (!favorite.hasOwnProperty("error")) {

                            const userLikes: any[] = [];

                            favorite.forEach((beatmap: any) => {
                                const usrLike: any = new RecLike();
                                usrLike.osuid = +user.userid;
                                usrLike.beatmapid = beatmap.id;
                                usrLike.origin = "favorite";
                                usrLike.value = `${beatmap.id}_set`;
                                usrLike.mode = "";
                                userLikes.push(usrLike);
                            })

                            RecLike.bulkSave(userLikes);
                        }
                    }

                    return resolve(true);

                }
            ),
            2,
        );

        const embed = new MessageEmbed()
            .setTitle("Done!")
            .setDescription("Done")

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand
