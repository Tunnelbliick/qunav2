import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { helpapex } from "../embeds/apex/help";
import { help8ball, helpchoose, helpwaifu } from "../embeds/old_commands/help";
import { helpmap } from "../embeds/osu/beatmap/help";
import { helpcard } from "../embeds/osu/card/help";
import { helpcompare } from "../embeds/osu/compare/help";
import { helpFarmdays, helpFarmhours, helpFarmMonth, helpFramWeeks } from "../embeds/osu/farm/help";
import { helplink } from "../embeds/osu/link/help";
import { helpNoChocke } from "../embeds/osu/nochocke/help";
import { helpWorldCup, helpWorldCupCompare } from "../embeds/osu/owc/help";
import { helpPickem, helpPredictions } from "../embeds/osu/pickem/help";
import { helpprofile } from "../embeds/osu/profile/help";
import { helpRecent } from "../embeds/osu/recent/help";
import { helprecentBest } from "../embeds/osu/recentbest/help";
import { helprecommend } from "../embeds/osu/recommend/recommend/help";
import { helpshowsuggestions } from "../embeds/osu/recommend/showsuggestion/help";
import { helpsuggest } from "../embeds/osu/recommend/suggest/help";
import { helpskills } from "../embeds/osu/skill/help";
import { helpTop } from "../embeds/osu/top/help";
import { helpunlink } from "../embeds/osu/unlink/help";
import { helpTimezone } from "../embeds/timezone/help";

export default {

    category: "osu!",
    aliases: ["help", "h"],
    description: "Help for quna",

    callback: async ({ message, args, prefix }) => {

        // THIS is just a quick and dirty way of doing this shit
        if (args[0] == null) {
            const embed = buildGlobalHelp(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "c" || args[0] == "compare") {
            const embed = helpcompare(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "fh" || args[0] == "farmhours") {
            const embed = helpFarmhours(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "farmdays" || args[0] == "fd") {
            const embed = helpFarmdays(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "farmweeks" || args[0] == "fw") {
            const embed = helpFramWeeks(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "farmmonth" || args[0] == "fm") {
            const embed = helpFarmMonth(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "tz" || args[0] == "timezone") {
            const embed = helpTimezone(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "link") {
            const embed = helplink(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "unlink") {
            const embed = helpunlink(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "m" || args[0] == "map") {
            const embed = helpmap(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["profile", "o", "osu", "p", "isu", "pmania", "profilemania", "maniaprofile", "catch", "pcatch", "profilecatch", "catchprofile", "ptaiko", "profiletaiko", "taikoprofile"].includes(args[0])) {
            const embed = helpprofile(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["r", "rs", "recent", "maniar", "maniars", "maniarecent", "catchr", "catchrs", "catchrecent", "taikor", "taikors", "taikorecent"].includes(args[0])) {
            const embed = helpRecent(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["rb", "maniarb", "catchrb", "taikorb"].includes(args[0])) {
            const embed = helprecentBest(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["top", "maniatop", "catchtop", "taikotop"].includes(args[0])) {
            const embed = helpTop(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["ss", "showsugs", "shows", "showsug", "suggestions", "showsuggestions"].includes(args[0])) {
            const embed = helpshowsuggestions(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["s", "sug", "suggest"].includes(args[0])) {
            const embed = helpsuggest(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["rec", "recommend"].includes(args[0])) {
            const embed = helprecommend(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "card") {
            const embed = helpcard(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "skills" || args[0] == "topskills") {
            const embed = helpskills(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "waifu" || args[0] == "rate" || args[0] == "waifuraiting") {
            const embed = helpwaifu(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "choose") {
            const embed = helpchoose(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "8ball") {
            const embed = help8ball(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (args[0] == "apex" || args[0] == "apexmap") {
            const embed = helpapex(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["owc", "mwc", "twc", "cwc"].includes(args[0])) {
            const embed = helpWorldCup(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["wcc"].includes(args[0])) {
            const embed = helpWorldCupCompare(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["pickem"].includes(args[0])) {
            const embed = helpPickem(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["predictions"].includes(args[0])) {
            const embed = helpPredictions(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else if (["nochocke", "nc"].includes(args[0])) {
            const embed = helpNoChocke(prefix);
            message.reply({ embeds: [embed] });
            return;
        } else {
            const embed = helpnotsupported(prefix);
            message.reply({ embeds: [embed] });
            return;
        }
    }

} as ICommand

function buildGlobalHelp(prefix: string) {
    const embed = new MessageEmbed()
        .setTitle("Quna commands")
        .setDescription(`Server prefix: \`${prefix}\`\n\`${prefix}info\`: For more info on Quna\nFor more help join our [Discord](https://discord.gg/azPWUfSMm3)`)
        .setFields([{
            name: `**__Utility commands__**`,
            value: "`prefix`: To change the prefix for Quna\n" +
                "`command`: To enable/disable a command\n" +
                "`channelOnly`: To limit specific commands to a channel\n" +
                "`requiredRole`: To set a required Role for a specific command"
        }, {
            name: `**__osu! basic__**`,
            value: "`link`: Links your account use `/link` if you have dms closed\n" +
                "`unlink`: Unlinks your account and deletes database stores\n" +
                "`compare`: Compare a players score on a map\n" +
                "`map`: Displays stats for a beatmap\n" +
                "`osu`: Displays the user profile with some stats\n" +
                "`top`: Displays the user top scores\n" +
                "`recentbest`: Displays the user top plays sorted by most recent\n" +
                "`nochocke`: Displays the user top scores unchocked\n" +
                "`recent`: Displays a users recent score\n" +
                "All commands have a gamemode version!"
        }, {
            name: `**__osu! skills__**`,
            value: "`skills`: Displays the top skills for a given user\n" +
                "`card`: Displays a usercard with stats\n"
        },
        {
            name: "**__pick'em__**",
            value: "`pickem`: Displays the current pickem\n" +
                "`/predict`: Predict a current round in the pickem **slash only**\n" +
                "`predictions`: Look at the predictions of a specific user\n" +
                "`leaderboard`: Look at the leaderboard for the current pick'em"
        },
        {
            name: "**__osu! World Cup__**",
            value: "`owc`: Look at osu world cup results \n" +
                "`mwc`: Look at mania world cup results\n" +
                "`twc`: Look at taiko world cup results\n" +
                "`cwc`: Look at catch world cup results\n" +
                "`wcc`: Compare world cup results between countries (medal count)"
        },
        /*  Commented out cause this is broke until i fix it!
        {
            name: `**__osu! recommend__**`,
            value: "`suggest`: Suggest a beatmap to Quna for its Suggestion engine engine\n" +
                "`showsuggestions`: Shows the Suggestions a user has given / liked\n" +
                "`recommend`: Request a beatmap recommendation from Quna\n"
        }, 
        */
        {
            name: `**__osu! farm__**`,
            value: "`timezone`: Change the users local timezone\n" +
                "`farmhours`: Displays a graph with the amount of top plays set at certain hours\n" +
                "`farmdays`: Displays a graph with the amount of top plays set at days of week\n" +
                "`farmweeks`: Displays a graph with the amount of top plays set at week of year\n" +
                "`farmdmoths`: Displays a graph with the amount of top plays set at month of year\n"
        }, {
            name: `**__API commands__**`,
            value: "`apex`: Displays the current Apex Legends map rotation\n"
        }, {
            name: `**__Fun commands__**`,
            value: "`8ball`: Ask Quna and her magic 8-Ball about something!\n" +
                "`choose`: Let Quna pick from multiple options!\n" +
                "`waifu`: Quna will rate a name you give her!"
        }])
        .setColor(0x737df9)


    return embed;
}

function helpnotsupported(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help not found")
        .setColor(0x737df9)
        .setDescription("This command doesnt have a help, or isnt supported yet.");


    return embed;
}

