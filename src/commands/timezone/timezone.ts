import { ICommand } from "wokcommands";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";

const moment = require('moment-timezone');
const ct = require('countries-and-timezones');

export default {

    category: "osu!",
    aliases: ["tz", "timez"],
    description: "Quna updates your local timezone",

    callback: async ({ message, args, prefix }) => {

        /*if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            let embed = helpTimezone(prefix);
            message.reply({ embeds: [embed] });
            return;
        }*/

    }

} as ICommand
