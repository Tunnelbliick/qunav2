import asyncBatch from "async-batch";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { buildAPIErrEmbed } from "../../../../embeds/osu/top/error";
import { topEmbed } from "../../../../embeds/osu/top/top";
import { checkIfUserExists } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { encrypt } from "../../../../utility/encrypt";
import { downloadAndOverrideBeatmap } from "../../../beatmaps/downloadbeatmap";
import { generateTopChart } from "../../../chart.js/top/top";
import { topFilterAndSort } from "../../../filter/top/top";
import { getTopForUser } from "../../../osu/top";
import { getUser, getUserByUsername } from "../../../osu/user";
import { buildFilter } from "./filter"

const DataImageAttachment = require("dataimageattachment");

export async function top(message: any, args: any, mode: any) {

    let index = 0;
    let max = 20;
    let top100: any;
    let username = "";
    let userid;
    let user: any;
    let max_retry = 6;
    let retry_count = 0;
    
    let discordid = message.author.id;

    message.channel.sendTyping();

    /*if (args[0] == "-h" || args[0] == "-help" || args[0] == "h" || args[0] == "help") {
        let embed = topHelp(prefix);
        message.reply({ embeds: [embed] });
        return;
    }*/

    let filterOptions = buildFilter(message, args, mode);

    if (filterOptions.username !== "") {

        user = await getUserByUsername(username, "osu");

        userid = user.id;
    } else {

        let userObject: any = await User.findOne({ discordid: await encrypt(discordid) });

        if (checkIfUserExists(userObject, message)) {
            return;
        }

        userid = userObject.userid;

        user = await getUser(userid, "osu");

    }

    top100 = await getTopForUser(userid, index, undefined, filterOptions.gamemode);

    if (top100 == null || top100 == "osuapierr") {
        buildAPIErrEmbed(message);
        return;
    }

    // top100 = top100.slice().reverse();

    top100 = topFilterAndSort(top100, filterOptions);

    const test = asyncBatch(top100,
        (task: any, taskIndex: number, workerIndex: number) => new Promise(
            async (resolve) => {
                let dest = `${process.env.FOLDER_TEMP}${task.value.beatmap.id}_${task.value.beatmap.checksum}.osu`;
                downloadAndOverrideBeatmap('https://osu.ppy.sh/osu/', dest, task.value.beatmap.id).then(() => { return resolve(true) });
            }
        ),
        2,
    );

    const p1 = new Promise((res) => setTimeout(() => res("p1"), 2500));

    await Promise.race([p1, test]);

    let chartPromise = generateTopChart(top100);

    let promises: Array<Promise<any>> = [];
    promises.push(topEmbed(top100, user, index, max));
    promises.push(chartPromise);

    const row = new MessageActionRow();

    let skip_prior_button = new MessageButton()
        .setCustomId(`${message.id}_skipdec`)
        .setEmoji("951823325586395167")
        .setStyle('PRIMARY')
    let prior_button = new MessageButton()
        .setCustomId(`${message.id}_dec`)
        .setEmoji("951821813288140840")
        .setStyle('PRIMARY');
    let next_button = new MessageButton()
        .setCustomId(`${message.id}_inc`)
        .setEmoji("951821813460115527")
        .setStyle('PRIMARY');
    let skip_next_button = new MessageButton()
        .setCustomId(`${message.id}_skipinc`)
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
        collector = message.channel.createMessageComponentCollector({ filter, time: 60000 })

    let reply: any;

    Promise.all(promises).then(async (result: any) => {
        if (top100.length != 1)
            reply = await message.reply({ embeds: [result[0]], components: [row], files: [new DataImageAttachment(result[1], "chart.png")] });
        else
            reply = await message.reply({ embeds: [result[0]] });
    });

    if (collector != null)
        collector.on("collect", async (i: any) => {

            let para = i.customId.split("_")[1];

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

            const embed: any = await topEmbed(top100, user, index, max).catch(async (err) => {
                if (retry_count == max_retry) {
                    return;
                }

                let embed: any = new MessageEmbed()
                    .setTitle("Error loading Page")
                    .setDescription("**Wow! Please wait a moment!**\n\nThe beatmaps are still being processed for the first time!")


                await reply.edit({ embeds: [embed], components: [row] })

                await setTimeout(async () => {

                    embed = await topEmbed(top100, user, index, max);
                    await reply.edit({ embeds: [embed], components: [row] });
                    await i.deferUpdate();

                }, 5000);

                retry_count++;

            })

            await reply.edit({ embeds: [embed], components: [row] });
            await i.deferUpdate();
        })

    if (collector != null)
        collector.on("end", async () => {

            prior_button.setDisabled(true);
            next_button.setDisabled(true);
            skip_next_button.setDisabled(true);
            skip_prior_button.setDisabled(true);


            const embed: any = await topEmbed(top100, user, index, max);

            await reply.edit({ embeds: [embed], components: [row] });
        });
}
