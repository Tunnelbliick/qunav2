import asyncBatch from "async-batch";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { nochockeEmbed } from "../../../../embeds/osu/nochocke/nochocke";
import { buildAPIErrEmbed } from "../../../../embeds/osu/top/error";
import { topEmbed } from "../../../../embeds/osu/top/top";
import { checkIfUserExists } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { downloadAndOverrideBeatmap } from "../../../beatmaps/downloadbeatmap";
import { generateNoChockeChart } from "../../../chart.js/nochocke/nochocke";
import { sortAndReverse, topFilterAndSort } from "../../../filter/top/top";
import { getNoChockeForUser, getTopForUser } from "../../../osu/top";
import { getUser, getUserByUsername } from "../../../osu/user";
import { simulateArgs, simulateFC } from "../../../pp/simulate";
import { buildFilter } from "./filter"
import { modeIntToMode } from "../../../osu/utility/utility";

const DataImageAttachment = require("dataimageattachment");

export interface unchocke {
    position: number,
    play: any,
    pp: number
}

export async function nochocke(interaction: any, message: any, args: any, mode: any) {

    let channel = undefined;
    let id = undefined;

    if (interaction) {
        channel = interaction.channel;
        id = interaction.id;
    } else {
        channel = message.channel;
        id = message.id;
    }

    let index = 0;
    let max = 20;
    let top100: any;
    let userid;
    let user: any;
    const max_retry = 6;
    let retry_count = 0;
    let top_pp = 0;
    let bonus_pp = 0;
    let unchocked_pp = 0;
    let difference = 0;

    const filterOptions = buildFilter(interaction, message, args, mode);

    if (filterOptions.username !== "") {

        user = await getUserByUsername(filterOptions.username, filterOptions.gamemode);

        userid = user.id;
    } else {

        const userObject: any = await User.findOne({ discordid: await encrypt(filterOptions.discordid) });

        if (checkIfUserExists(userObject, message)) {
            return;
        }

        userid = userObject.userid;

        user = await getUser(userid, filterOptions.gamemode);

    }

    top100 = await getNoChockeForUser(userid, index, undefined, filterOptions.gamemode);

    if (top100 == null || top100 == "osuapierr") {
        buildAPIErrEmbed(message);
        return;
    }

    top100.forEach((play: any) => {
        top_pp += play.value.weight.pp
    });

    const total_pp = user.statistics.pp;
    bonus_pp = total_pp - top_pp;


    top100 = topFilterAndSort(top100, filterOptions);

    const race = asyncBatch(top100,
        (task: any) => new Promise(
            async (resolve) => {
                const dest = `${process.env.FOLDER_TEMP}${task.value.beatmap.id}_${task.value.beatmap.checksum}.osu`;
                downloadAndOverrideBeatmap('https://osu.ppy.sh/osu/', dest, task.value.beatmap.id).then(() => { return resolve(true) });
            }
        ),
        2,
    );

    const p1 = new Promise((res) => setTimeout(() => res("p1"), 2500));

    const completed = await Promise.race([p1, race]);

    if (completed === "p1") {
        const embed: any = new MessageEmbed()
            .setTitle("Error loading Page")
            .setDescription("**Wow! Please wait a moment!**\n\nThe beatmaps are still being processed for the first time!")

        if (interaction) {
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        await message.reply({ embeds: [embed] });
        return;
    }


    let nochocke = await getUnchockedForTop100(top100);
    if (filterOptions.sort != "position") {
        nochocke = sortAndReverse(nochocke, filterOptions);
    }

    const chartPromise = generateNoChockeChart(top100, nochocke);

    top_pp = 0;
    let i = 0
    top100.forEach((play: any) => {
        const weight = Math.pow(0.95, i);
        top_pp += play.value.pp * weight;
        i++;
    });

    unchocked_pp = 0;
    nochocke.forEach((play: any) => {
        const weight = Math.pow(0.95, play.position);
        unchocked_pp += play.pp * weight;
    })

    if (bonus_pp < 0) {
        bonus_pp = 0;
    }

    difference = unchocked_pp - top_pp;
    unchocked_pp += bonus_pp;
    top_pp += bonus_pp;

    max = Math.ceil(top100.length / 5);

    if (max < 1) {
        max = 1;
    }

    const promises: Array<Promise<any>> = [];
    promises.push(nochockeEmbed(nochocke, user, index, max, top_pp, unchocked_pp, difference));
    promises.push(chartPromise);

    const row = new MessageActionRow();

    const skip_prior_button = new MessageButton()
        .setCustomId(`${id}_skipdec`)
        .setEmoji("951823325586395167")
        .setStyle('PRIMARY')
    const prior_button = new MessageButton()
        .setCustomId(`${id}_dec`)
        .setEmoji("951821813288140840")
        .setStyle('PRIMARY');
    const next_button = new MessageButton()
        .setCustomId(`${id}_inc`)
        .setEmoji("951821813460115527")
        .setStyle('PRIMARY');
    const skip_next_button = new MessageButton()
        .setCustomId(`${id}_skipinc`)
        .setEmoji("951823325557047366")
        .setStyle('PRIMARY');

    row.addComponents([skip_prior_button, prior_button, next_button, skip_next_button])


    const filter = (i: any) => {
        return i.customId === prior_button.customId ||
            i.customId === next_button.customId ||
            i.customId === skip_next_button.customId ||
            i.customId === skip_prior_button.customId;
    }

    let collector: any = null;

    if (top100.length != 1)
        collector = channel.createMessageComponentCollector({ filter, time: 60000 })

    let reply: any;

    Promise.all(promises).then(async (result: any) => {
        if (top100.length != 1) {
            if (interaction) {
                await interaction.editReply({ embeds: [result[0]], components: [row], files: [new DataImageAttachment(result[1], "chart.png")] });
            } else {
                reply = await message.reply({ embeds: [result[0]], components: [row], files: [new DataImageAttachment(result[1], "chart.png")] });
            }
        } else {
            if (interaction) {
                await interaction.editReply({ embeds: [result[0]] });
            } else {
                reply = await message.reply({ embeds: [result[0]] });
            }
        }
    });

    if (collector != null)
        collector.on("collect", async (i: any) => {

            const para = i.customId.split("_")[1];

            switch (para) {
                case "dec":
                    if (index > 0) {
                        index--;
                    }
                    break;
                case "inc":
                    if (index + 1 < max) {
                        index++;
                    }
                    break;
                case "skipdec":
                    if (index > 4) {
                        index = index - 5;
                    } else {
                        index = 0;
                    }
                    break;
                case "skipinc":
                    if (index + 5 < max - 1) {
                        index = index + 5;
                    } else {
                        index = max - 1;
                    }
                    break;
            }

            collector.resetTimer();

            const embed: any = await nochockeEmbed(nochocke, user, index, max, top_pp, unchocked_pp, difference).catch(async (err) => {
                if (retry_count == max_retry) {
                    return;
                }

                let embed: any = new MessageEmbed()
                    .setTitle("Error loading Page")
                    .setDescription("**Wow! Please wait a moment!**\n\nThe beatmaps are still being processed for the first time!")


                if (interaction) {
                    await interaction.editReply({ embeds: [embed], components: [row] })
                } else {
                    await reply.edit({ embeds: [embed], components: [row] })
                }

                await setTimeout(async () => {

                    embed = await nochockeEmbed(nochocke, user, index, max, top_pp, unchocked_pp, difference);
                    if (interaction) {
                        await interaction.editReply({ embeds: [embed], components: [row] })
                    } else {
                        await reply.edit({ embeds: [embed], components: [row] })
                    }
                    await i.deferUpdate();

                }, 5000);

                retry_count++;

            })

            if (interaction) {
                await interaction.editReply({ embeds: [embed], components: [row] })
            } else {
                await reply.edit({ embeds: [embed], components: [row] })
            }
            await i.deferUpdate();
        })

    if (collector != null)
        collector.on("end", async () => {

            prior_button.setDisabled(true);
            next_button.setDisabled(true);
            skip_next_button.setDisabled(true);
            skip_prior_button.setDisabled(true);


            const embed: any = await nochockeEmbed(nochocke, user, index, max, top_pp, unchocked_pp, difference);

            if (interaction) {
                await interaction.editReply({ embeds: [embed], components: [row] })
            } else {
                await reply.edit({ embeds: [embed], components: [row] })
            }
        });
}

async function getUnchockedForTop100(top100: any[]) {

    const unchocke: unchocke[] = await asyncBatch(top100,
        (task: any) => new Promise(
            async (resolve) => {

                const play = task.value;
                const max_combo = task.max_combo;

                const simulateArgs: simulateArgs = {
                    mapid: play.beatmap.id,
                    checksum: play.beatmap.checksum,
                    misses: play.statistics.count_miss,
                    mehs: play.statistics.count_50,
                    goods: play.statistics.count_100,
                    great: play.statistics.count_300,
                    combo: max_combo,
                    score: play.score,
                    mode: modeIntToMode(play.ruleset_id),
                    mods: play.mods
                }

                simulateFC(simulateArgs).then((pp: any) => {

                    return resolve({ position: 0, play: play, pp: pp })

                });
            }
        ),
        10,
    );

    let index = 0;
    const unchocked_indexed: unchocke[] = [];
    unchocke.sort((a: unchocke, b: unchocke) => b.pp - a.pp).forEach((unchocke: unchocke) => {
        unchocke.position = index;
        unchocked_indexed.push(unchocke);
        index++;
    });

    return unchocked_indexed;

}
