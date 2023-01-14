import asyncBatch from "async-batch";
import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { getFavorite, getPinned, getTopForUser } from "../../api/osu/top";
import { getUserByUsername } from "../../api/osu/user";
import { getDailyTop, getOsuTop10000 } from "../../api/osudaily/dailytop";
import { like } from "../../interfaces/Like";
import { QunaUser } from "../../interfaces/QunaUser";
import RecLike from "../../models/RecLike";
import User from "../../models/User";
import UserHash from "../../models/UserHash";
const hash = require("hash-sum")
const tabletojson = require('tabletojson').Tabletojson;


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

        let offset = 98;

        do {
            const daily = await getOsuTop10000(offset);

            const scrape = tabletojson.convert(
                daily.data,
            );

            //const quna_users: QunaUser[] = await User.find({});
            let index = 0;

            const race = asyncBatch(scrape[0],
                (user: any) => new Promise(
                    async (resolve) => {
                        index++;
                        if (user != null && user != undefined) {

                            const profile = await getUserByUsername(user["1"]); 

                            const userid = profile.id;

                            if (await RecLike.exists({ osuid: userid }) !== null) {
                                console.log(`${index}/${scrape[0].length}`);
                                return resolve(true);
                            }

                            let top: any = [];
                            let pinned: any = [];
                            let favorite: any = [];
                            let changed = false;

                            const topPromise: any = await getTopForUser(userid);
                            const pinnedPromise: any = await getPinned(userid);
                            const favoritePromise: any = await getFavorite(userid);

                            await Promise.allSettled([topPromise, pinnedPromise, favoritePromise]).then(((result: any) => {
                                top = result[0].value;
                                pinned = result[1].value;
                                favorite = result[2].value;
                            }))

                            const userHash = new UserHash();
                            userHash.osuid = userid;

                            if (top != "osuapierr") {

                                const userLikes: any[] = [];
                                const hashList: any[] = [];

                                top.forEach((play: any) => {

                                    let value = `${play.value.beatmap.id}_${play.value.mods.join("")}`

                                    const usrLike: like = new RecLike();
                                    usrLike.osuid = userid;
                                    usrLike.beatmapid = play.value.beatmap.id;
                                    usrLike.origin = "top";
                                    usrLike.value = value;
                                    usrLike.mode = play.value.beatmap.mode
                                    userLikes.push(usrLike);
                                    hashList.push(value);
                                })

                                userHash.topHash = hash(hashList);
                                changed = true;

                                RecLike.bulkSave(userLikes);
                            }

                            if (!pinned.hasOwnProperty("error")) {


                                const userLikes: any[] = [];
                                const hashList: any[] = [];

                                pinned.forEach((play: any) => {

                                    let value = `${play.beatmap.id}_${play.mods.join("")}`

                                    const usrLike: like = new RecLike();
                                    usrLike.osuid = userid;
                                    usrLike.beatmapid = play.beatmap.id;
                                    usrLike.origin = "pinned";
                                    usrLike.value = value;
                                    usrLike.mode = play.beatmap.mode;
                                    userLikes.push(usrLike);
                                    hashList.push(value);
                                })

                                userHash.pinnedHash = hash(hashList);
                                changed = true;
                                RecLike.bulkSave(userLikes);
                            }

                            if (!favorite.hasOwnProperty("error")) {

                                const userLikes: any[] = [];
                                const hashList: any[] = [];

                                favorite.forEach((beatmap: any) => {

                                    let value = `${beatmap.id}_set`;

                                    const usrLike: any = new RecLike();
                                    usrLike.osuid = userid
                                    usrLike.beatmapid = beatmap.id;
                                    usrLike.origin = "favorite";
                                    usrLike.value = value;
                                    usrLike.mode = "";
                                    userLikes.push(usrLike);
                                    hashList.push(value);
                                })

                                userHash.favoriteHash = hash(hashList);
                                changed = true;
                                RecLike.bulkSave(userLikes);
                            }

                            if (changed && (userHash.osuid != null || userHash.osuid != undefined))
                                await UserHash.updateOne({ osuid: userHash.osuid }, userHash, { upsert: true }).exec();
                        }

                        console.log(`${index}/${scrape[0].length}`);
                        return resolve(true);

                    }
                ),
                3,
            );

            await Promise.race([race]);
            console.log(`Page ${offset} of 200`);
            await sleep(1000);
            offset++;
        } while (offset < 200);

        const embed = new MessageEmbed()
            .setTitle("Done!")
            .setDescription("Done")

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand

function sleep(ms: any) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
