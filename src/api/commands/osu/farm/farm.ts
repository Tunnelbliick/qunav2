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

    let index = 0;
    let top100: any;
    let username = "";
    let userid;
    let discordid;
    let user: any;
    let userObject: any;
    let timezone;
    let usernameargs = [];

    message.channel.sendTyping();

    for (let arg of args) {

        if (arg.startsWith("<@")) {
            discordid = args[0].replace("<@", "").replace(">", "");

            userObject = await User.findOne({ discordid: await encrypt(discordid) });

            if (checkIfUserIsLInked(userObject, args[0], message)) {
                return;
            }

            userid = userObject.userid;

            user = await getUser(userid, "osu");

        } else if (!isNaN(+arg) && (+arg <= 12 && +arg >= -12)) {

            let time = moment();

            let input: any = arg;

            if (+input) {
                input = parseInt(input);
            }

            timezone = getZoneFromOffset(time.utcOffset(input).format("Z"))[0]

        } else {
            usernameargs.push(arg);
        }

    }

    if (user == null && usernameargs.length == 0) {
        userObject = await User.findOne({ discordid: await encrypt(message.author.id) });

        if (checkIfUserExists(userObject, message)) {
            return;
        }

        userid = userObject.userid;

        user = await getUser(userid, "osu");

    } else if (user == null && usernameargs.length != 0) {
        username = buildUsernameOfArgs(usernameargs);

        user = await getUserByUsername(username, "osu");

        userid = user.id;

    }

    top100 = await getRecentBestForUser(userid, index);

    if (top100 == null || top100 == "osuapierr") {
        buildAPIErrEmbed(message);
        return;
    }

    let hours: any = [];

    if (timezone == null && userObject != null)
        timezone = userObject.timezone;
    if (timezone == null)
        timezone = ct.getCountry(top100[0].value.user.country_code).timezones[0];

    let shortzone = moment().tz(timezone).format("Z");

    for (let top of top100) {
        let n = null;
        switch (mode) {
            case "hour":
                n = moment(top.value.created_at).tz(timezone).format("H");
                break;
            case "day":
                n = moment(top.value.created_at).tz(timezone).format("d");
                break;
            case "week":
                n = moment(top.value.created_at).tz(timezone).format("W") - 1;
                break;
            case "month":
                n = moment(top.value.created_at).tz(timezone).format("M") - 1;
                break;
            default:
                n = moment(top.value.created_at).tz(timezone).format("H");
                break;
        }
        if (hours[n] == null)
            hours[n] = 1
        else
            hours[n] = hours[n] + 1
    }

    let chart = null;
    switch (mode) {
        case "hour":
            chart = await generateFarmhoursChart(hours);
            break;
        case "day":
            chart = await generateFarmdaysChart(hours);
            break;
        case "week":
            chart = await generateFarmweekChart(hours);
            break;
        case "month":
            chart = await generateFarmmonthChart(hours);
            break;
        default:
            chart = await generateFarmhoursChart(hours);
            break;
    }

    let fields = "Number of top 100 scores for this specific case:";

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

    let reply = await message.reply({ embeds: [compact], files: [new DataImageAttachment(chart, "farmhours.png")] });
}

function getZoneFromOffset(offsetString: string) {
    return moment.tz.names().filter((tz: any) => moment.tz(tz).format('Z') === offsetString);
}
