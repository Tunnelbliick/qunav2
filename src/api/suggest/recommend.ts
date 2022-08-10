import { Message } from "discord.js";
import { alreadyUpvoted } from "../../embeds/osu/recommend/suggest/error";
import { CategoryVote } from "../../models/CategoryVote";
import Recommendation from "../../models/Recommendation";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { suggestion_collector_params } from "./collector";

const Procyon = require('procyon')

export async function recommend(suggestion: suggestion_collector_params, interaction: any) {

    const procyon: any = new Procyon({
        className: 'maps'
    });

    const beatmap = suggestion.beatmap;
    const categories = suggestion.categories;
    const mods = suggestion.mods;
    const stats = suggestion.stats;
    const difficulty = suggestion.difficulty;
    const message = suggestion.message;
    const row = suggestion.row;
    const suggest = suggestion.suggest;
    const discard = suggestion.discard;

    let categoryVoteArray = [];

    const existingrecomendation: any = await Recommendation.findOne({ mapid: beatmap.id, mods: mods });

    let user: any = await User.findOne({ discordid: await encrypt(interaction.user.id) });

    // CategoryVoting
    for (let category of categories) {
        let categoryVote: CategoryVote = new CategoryVote();

        categoryVote.category = category;
        let upvote = categoryVote.upvote;

        upvote.push(user.userid);

        categoryVote.upvote = upvote;

        categoryVoteArray.push(categoryVote);
    }

    let recomendation = new Recommendation();
    if (existingrecomendation == undefined) {
        recomendation.mapid = beatmap.id;
        recomendation.title = beatmap.beatmapset.title;
        recomendation.artist = beatmap.beatmapset.artist;
        recomendation.version = beatmap.version;
        recomendation.creator = beatmap.beatmapset.creator;
        recomendation.cover = beatmap.beatmapset.covers.cover;
        recomendation.upvote = [interaction.user.id];
        recomendation.downvote = [];
        recomendation.mods = mods;
        recomendation.type = categoryVoteArray;
        recomendation.drain = beatmap.hit_length;
        recomendation.length = beatmap.total_length;
        recomendation.circles = beatmap.count_circles;
        recomendation.sliders = beatmap.count_sliders;
        recomendation.spinners = beatmap.count_spinners;
        recomendation.ar = difficulty.ar.toFixed(2).replace(/[.,]00$/, "");
        recomendation.od = difficulty.od.toFixed(2).replace(/[.,]00$/, "");
        recomendation.cs = stats.cs.toFixed(2).replace(/[.,]00$/, "");
        recomendation.hp = difficulty.hp.toFixed(2).replace(/[.,]00$/, "");
        recomendation.bpm = stats.bpm;
        recomendation.star = difficulty.star.toFixed(2);

        await recomendation.save();
        await procyon.liked(user.userid, recomendation.id);

        return "done"

    } else {

        let upvote = existingrecomendation.upvote;

        if (upvote.includes(user.userid)) {

            suggest.setDisabled(true);
            discard.setDisabled(true);

            alreadyUpvoted(beatmap, message, row);
            return undefined;

        } else {
            let upvote: any = existingrecomendation.upvote;
            upvote.push(user.userid);
            existingrecomendation.upvote = upvote;
            await existingrecomendation.save();
            await procyon.liked(user.userid, existingrecomendation.id);

            return "done"
        }

    }
}