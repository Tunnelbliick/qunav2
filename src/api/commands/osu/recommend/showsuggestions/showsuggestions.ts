import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { queryError } from "../../../../../embeds/osu/recommend/showsuggestion/error";
import { buildshowSuggestions, show_suggestion_embed } from "../../../../../embeds/osu/recommend/showsuggestion/showsuggestion";
import { checkIfUserIsLInked } from "../../../../../embeds/utility/nouserfound";
import Recommendation from "../../../../../models/Recommendation";
import User from "../../../../../models/User";
import { buildUsernameOfArgs } from "../../../../../utility/buildusernames";
import { encrypt } from "../../../../../utility/encrypt";
import { calcualteStatsFromBeatmapforMods } from "../../../../beatmaps/stats";
import { getUser, getUserByUsername } from "../../../../osu/user";
import { launchShowSuggestionCollector, show_suggestion_collector_params } from "../../../../recommend/showsuggestions/collector";
import { filterRecommends, suggestion_filter } from "../../../../recommend/showsuggestions/filter";
import { buildSearch } from "../../../../utility/buildsearch";

export async function showsuggestions(message: any, args: any, prefix: any) {

    let userid = message.author.id
    let username = null;
    let userObject = null;
    let osu_user: any = null;

    message.channel.sendTyping();

    const option_filter: suggestion_filter = filterRecommends(args);

    if (args[0] && args[0].startsWith("<@")) {
        userid = args[0].replace("<@", "").replace(">", "");
    }

    if (option_filter.username !== "") {
        username = option_filter.username;
        osu_user = await getUserByUsername(username, "osu");
    } else {
        userObject = await User.findOne({ discordid: await encrypt(userid) });

        if (checkIfUserIsLInked(userObject, args[0], message)) {
            return;
        }

        osu_user = await getUser(userObject!.userid, "osu");
    }

    let query: any = {};
    try {
        query = buildSearch(option_filter);
    } catch (error: any) {
        queryError(message, error);
        return;
    }

    const recommendations: any = await Recommendation.find(query);

    const skip_prior_button = new MessageButton()
        .setCustomId(`${message.id}_skipdec`)
        .setEmoji("951823325586395167")
        .setStyle('PRIMARY');
    const prior_button = new MessageButton()
        .setCustomId(`${message.id}_dec`)
        .setEmoji("951821813288140840")
        .setStyle('PRIMARY');
    const next_button = new MessageButton()
        .setCustomId(`${message.id}_inc`)
        .setEmoji("951821813460115527")
        .setStyle('PRIMARY');
    const skip_next_button = new MessageButton()
        .setCustomId(`${message.id}_skipinc`)
        .setEmoji("951823325557047366")
        .setStyle('PRIMARY');

    const row = new MessageActionRow();
    const max = recommendations.length;
    const pagecontent = recommendations.slice(0 * 5, 0 + 5);

    const embed_params: show_suggestion_embed = {
        current_page: 0,
        max: recommendations.length,
        suggestions: pagecontent,
        user: osu_user
    }

    let msg: any;

    const recommendationlist = await buildshowSuggestions(embed_params);

    if (max > 5) {
        row.addComponents([skip_prior_button, prior_button, next_button, skip_next_button])
        msg = await message.reply({ embeds: [recommendationlist], components: [row] });

        const collector_params: show_suggestion_collector_params = {
            message: msg,
            row: row,
            next_button: next_button,
            prior_button: prior_button,
            skip_next_button: skip_next_button,
            skip_prior_button: skip_prior_button,
            user: osu_user,
            suggestions: recommendations
        }

        launchShowSuggestionCollector(collector_params);

    } else {
        msg = await message.reply({ embeds: [recommendationlist] });
    }


}