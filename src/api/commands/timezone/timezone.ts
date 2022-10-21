import { MessageEmbed } from "discord.js";
import { checkIfUserExists } from "../../../embeds/utility/nouserfound";
import User from "../../../models/User";
import { encrypt } from "../../../utility/encrypt";
import { getUser } from "../../osu/user";

const moment = require('moment-timezone');
const ct = require('countries-and-timezones');

export async function changetimezone(message: any, args: any, prefix: any) {

    const userObject: any = await User.findOne({ discordid: await encrypt(message.author.id) });

    if (checkIfUserExists(userObject, message)) {
        return;
    }

    message.channel.sendTyping();

    const userid = userObject.userid;

    const user: any = await getUser(userid, "osu");

    if (args[0] == "-r" || args[0] == "r") {
        userObject.timezone = undefined;
        await userObject.save();

        const timezone = ct.getCountry(user.country_code).timezones[0];

        const embed = new MessageEmbed()
            .setTitle("Timezone Edited!")
            .setColor(0x737df9)
            .setDescription(`Your timezone is now \`UTC${moment().tz(timezone).format("Z")}\``)

        await message.reply({ embeds: [embed] });
        return;
    }

    const time = new moment();

    let input: any = args[0]

    if (+input) {
        input = parseInt(input);
    }

    userObject.timezone = getZoneFromOffset(time.utcOffset(input).format("Z"))[0];

    await userObject.save();

    const embed = new MessageEmbed()
        .setTitle("Changed your local timezone")
        .setColor(0x737df9)
        .setDescription(`Your timezone is now \`UTC${moment().tz(userObject.timezone).format("Z")}\``)

    await message.reply({ embeds: [embed] });
    return;
}

function getZoneFromOffset(offsetString: string) {
    return moment.tz.names().filter((tz: any) => moment.tz(tz).format('Z') === offsetString);
}