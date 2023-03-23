import asyncBatch from "async-batch";
import { MessageEmbed } from "discord.js";
import { trusted } from "mongoose";
import { ICommand } from "wokcommands";
import { getFavorite, getPinned, getTopForUser } from "../../api/osu/top";
import { getUserByUsername } from "../../api/osu/user";
import { parseModString, parseModRestricted } from "../../api/osu/utility/parsemods";
import { getDailyTop, getOsuTop10000 } from "../../api/osudaily/dailytop";
import { like } from "../../interfaces/Like";
import { QunaUser } from "../../interfaces/QunaUser";
import RecLike from "../../models/RecLike";
import User from "../../models/User";
import UserHash from "../../models/UserHash";
const hash = require("hash-sum")
const tabletojson = require('tabletojson').Tabletojson;
const { getCodeList } = require('country-list');


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


        let country_code = getCodeList();
        let offset = 1;
        let skip = true;
        let skipuntill = "ua"
        let last_user: any = undefined;

        for (const code in country_code) {

            if (code == skipuntill) {
                skip = false;
                offset = 149;
            }

            if (!skip) {

                console.log(`Country ${code}`);

                do {
                    await getOsuTop10000(offset, code).then(async (daily) => {
                        // Do something with the result

                        const scrape = tabletojson.convert(
                            daily.data,
                        );

                        //const quna_users: QunaUser[] = await User.find({});
                        let index = 0;

                        if (scrape.length !== 0) {

                            console.log(`Page ${offset} of 200`);

                            let users = scrape[0];
                            if ((users[0]["1"] === "mrekk" && users[1]["1"] === "lifeline") || last_user == users[0]["1"]) {
                                offset = 200;
                            } else {

                                last_user = users[0]["1"];

                                const race = asyncBatch(scrape[0],
                                    (user: any) => new Promise(
                                        async (resolve) => {
                                            index++;
                                            if (user != null && user != undefined) {

                                                const profile = await getUserByUsername(user["1"]);

                                                const userid = profile.id;

                                                let top: any = [];
                                                let pinned: any = [];
                                                let favorite: any = [];
                                                let changed = false;

                                                const topPromise: any = await getTopForUser(userid);

                                                await Promise.allSettled([topPromise]).then(((result: any) => {
                                                    top = result[0].value;
                                                }))

                                                const userHash = user;
                                                userHash.osuid = userid;

                                                if (top != null && top != undefined && top != "osuapierr") {

                                                    const userLikes: any[] = [];
                                                    const hashList: any[] = [];

                                                    top.slice(0, 25).forEach((play: any) => {

                                                        let mods = parseModRestricted(play.value.mods);
                                                        let value = `${play.value.beatmap.id}_${mods.join("")}`

                                                        const usrLike: like = new RecLike();
                                                        usrLike.osuid = userid;
                                                        usrLike.beatmapid = play.value.beatmap.id;
                                                        usrLike.origin = "top";
                                                        usrLike.vote = "like";
                                                        usrLike.value = value;
                                                        usrLike.mode = play.value.beatmap.mode
                                                        userLikes.push(usrLike);
                                                        hashList.push(value);
                                                    })

                                                    userHash.topHash = hash(hashList);
                                                    changed = true;

                                                    try {
                                                        await RecLike.insertMany(userLikes, { ordered: false });
                                                    } catch (error) {
                                                        console.error('Error inserting user likes:', error);
                                                        return resolve(true);
                                                    }
                                                }

                                                /*   if (!pinned.hasOwnProperty("error")) {
                       
                       
                                                       const userLikes: any[] = [];
                                                       const hashList: any[] = [];
                       
                                                       pinned.forEach((play: any) => {
                       
                                                           let value = `${play.beatmap.id}_${play.mods.join("")}`
                       
                                                           const usrLike: like = new RecLike();
                                                           usrLike.osuid = userid;
                                                           usrLike.beatmapid = play.beatmap.id;
                                                           usrLike.origin = "pinned";
                                                           usrLike.vote = "like";
                                                           usrLike.value = value;
                                                           usrLike.mode = play.beatmap.mode;
                                                           userLikes.push(usrLike);
                                                           hashList.push(value);
                                                       })
                       
                                                       userHash.pinnedHash = hash(hashList);
                                                       changed = true;
                                                       RecLike.bulkSave(userLikes);
                                                   }*/

                                                /* if (!favorite.hasOwnProperty("error")) {
                     
                                                     const userLikes: any[] = [];
                                                     const hashList: any[] = [];
                     
                                                     favorite.forEach((beatmap: any) => {
                     
                                                         let value = `${beatmap.id}_set`;
                     
                                                         const usrLike: any = new RecLike();
                                                         usrLike.osuid = userid
                                                         usrLike.beatmapid = beatmap.id;
                                                         usrLike.origin = "favorite";
                                                         usrLike.value = value;
                                                         usrLike.vote = "like";
                                                         usrLike.mode = "";
                                                         userLikes.push(usrLike);
                                                         hashList.push(value);
                                                     })
                     
                                                     userHash.favoriteHash = hash(hashList);
                                                     changed = true;
                                                     RecLike.bulkSave(userLikes);
                                                 }*/

                                                if (changed && (userHash.osuid != null || userHash.osuid != undefined)) {
                                                    try {
                                                        await UserHash.updateOne({ osuid: userHash.osuid }, userHash, { upsert: true }).exec();
                                                    } catch (error) {
                                                        console.error('Error updating UserHash:', error);
                                                        return resolve(true);
                                                    }
                                                }
                                            }
                                            return resolve(true);

                                        }
                                    ),
                                    10,
                                );
                                offset++;

                                await Promise.race([race]);
                                await sleep(100);
                            }
                        } else {
                            offset = 200;

                            console.log(scrape);
                        }

                    })
                        .catch((error) => {
                            console.error('Error encountered while fetching data:', error);
                            offset++;
                        });

                } while (offset < 200);

            }

            offset = 1;
        }

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
