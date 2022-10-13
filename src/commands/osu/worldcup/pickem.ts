import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import owc from "../../../models/owc";
import owcgame from "../../../models/owcgame";
import BSON from "bson";
import pickemRegistration from "../../../models/pickemRegistration";
import { encrypt } from "../../../utility/encrypt";
import User from "../../../models/User";
import { checkIfUserExists } from "../../../embeds/utility/nouserfound";
import { pickem } from "../../../api/pickem/pickem";
export default {

    category: "osu!",
    slash: "both",
    description: "Current Pickem!",
    options: [

    ],
    callback: async ({ message, interaction, args, prefix, client }) => {

        let default_mode = "osu"
        let current_tournament = "r8ll3trn";

        await interaction_thinking(interaction);
        message_thinking(message);

        await pickem(message, interaction, args);

        //await getInfo(message, interaction, args, default_mode);

    }

} as ICommand