export async function farm(message: any, args: any, prefix: any, type: any) {

} import { MessageEmbed } from "discord.js";
import { buildAPIErrEmbed } from "../../../../embeds/osu/profile/error";
import { checkIfUserExists, checkIfUserIsLInked } from "../../../../embeds/utility/nouserfound";
import User from "../../../../models/User";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { replaceFirstDots } from "../../../../utility/comma";
import { encrypt } from "../../../../utility/encrypt";
import { generateFarmdaysChart } from "../../../chart.js/farmdays/farmdays";

import { generateFarmhoursChart } from "../../../chart.js/farmhours/farmhours";
import { generateFarmmonthChart } from "../../../chart.js/farmmonth/farmmonth";
import { generateFarmweekChart } from "../../../chart.js/farmweeks/farmweeks";
import { getRecentBestForUser } from "../../../osu/recentbest";
import { getUser, getUserByUsername } from "../../../osu/user";
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const DataImageAttachment = require("dataimageattachment");

const moment = require('moment-timezone');
const ct = require('countries-and-timezones');

export async function farmgraph(message: any, args: any, prefix: any, mode: any) {

    const index = 0;
    let top100: any;
    let username = "";
    let userid;
    let discordid;
    let user: any;
    let userObject: any;
    let timezone;
    const usernameargs = [];

    let default_mode = "osu";

    const gamemode = ["osu", "mania", "taiko", "catch", "ctb", "fruits"]

    let select_mode = "";

    message.channel.sendTyping();

    for (const arg of args) {

        if (select_mode = "gamemode") {
            if (gamemode.includes(arg)) {
                default_mode = arg;
            }
        } else {
            if (arg === "-m" || arg === "m") {
                select_mode = "gamemode";
            } else {

                if (arg.startsWith("<@")) {
                    discordid = args[0].replace("<@", "").replace(">", "");

                    userObject = await User.findOne({ discordid: await encrypt(discordid) });

                    if (checkIfUserIsLInked(userObject, args[0], message)) {
                        return;
                    }

                    userid = userObject.userid;

                    user = await getUser(userid, default_mode);

                } else if (!isNaN(+arg) && (+arg <= 12 && +arg >= -12)) {

                    const time = moment();

                    let input: any = arg;

                    if (+input) {
                        input = parseInt(input);
                    }

                    timezone = getZoneFromOffset(time.utcOffset(input).format("Z"))[0]

                } else {
                    usernameargs.push(arg);
                }
            }
        }
    }

    if (user == null && usernameargs.length == 0) {
        userObject = await User.findOne({ discordid: await encrypt(message.author.id) });

        if (checkIfUserExists(userObject, message)) {
            return;
        }

        userid = userObject.userid;

        user = await getUser(userid, default_mode);

    } else if (user == null && usernameargs.length != 0) {
        username = buildUsernameOfArgs(usernameargs);

        user = await getUserByUsername(username, default_mode);

        userid = user.id;

    }

    top100 = await getRecentBestForUser(userid, index, default_mode);

    if (top100 == null || top100 == "osuapierr") {
        buildAPIErrEmbed(message);
        return;
    }

    const hours: any = [];

    if (timezone == null && userObject != null)
        timezone = userObject.timezone;
    if (timezone == null)
        timezone = ct.getCountry(top100[0].value.user.country_code).timezones[0];

    const shortzone = moment().tz(timezone).format("Z");

    for (const top of top100) {
        let n = null;
        switch (mode) {
            case "hour":
                n = moment(top.value.ended_at).tz(timezone).format("H");
                break;
            case "day":
                n = moment(top.value.ended_at).tz(timezone).format("d");
                break;
            case "week":
                n = moment(top.value.ended_at).tz(timezone).format("W") - 1;
                break;
            case "month":
                n = moment(top.value.ended_at).tz(timezone).format("M") - 1;
                break;
            default:
                n = moment(top.value.ended_at).tz(timezone).format("H");
                break;
        }
        if (hours[n] == null)
            hours[n] = 1
        else
            hours[n] = hours[n] + 1
    }

    let chart = null;

    let fields = "Number of top 100 scores set at specific hour";

    switch (mode) {
        case "hour":
            chart = await generateFarmhoursChart(hours);
            fields = "Number of top 100 scores set at specific hour";
            break;
        case "day":
            chart = await generateFarmdaysChart(hours);
            fields = "Number of top 100 scores set at specific day";
            break;
        case "week":
            chart = await generateFarmweekChart(hours);
            fields = "Number of top 100 scores set at specific week";
            break;
        case "month":
            chart = await generateFarmmonthChart(hours);
            fields = "Number of top 100 scores set at specific month";
            break;
        default:
            chart = await generateFarmhoursChart(hours);
            fields = "Number of top 100 scores set at specific hour";
            break;
    }

    let global_rank = user.statistics.global_rank;
    if (global_rank == null)
        global_rank = 0;

    let country_rank = user.statistics.rank.country;
    if (country_rank == null)
        country_rank = 0;

    const compact = new MessageEmbed()
        .setAuthor({ name: `${user.username} - ${user.statistics.pp.toFixed(2)}pp | #${replaceFirstDots(global_rank)} (${user.country_code}${country_rank})`, iconURL: `${user.avatar_url}` })
        .setColor("#4b67ba")
        .setDescription(fields)
        .setImage("attachment://farmhours.png")
        .setFooter({ text: `🕐 Timezone UTC${shortzone} | Use ${prefix}tz to change your timezone` })

    const reply = await message.reply({ embeds: [compact], files: [new DataImageAttachment(chart, "farmhours.png")] });
}

function getZoneFromOffset(offsetString: string) {
    return moment.tz.names().filter((tz: any) => moment.tz(tz).format('Z') === offsetString);
}
