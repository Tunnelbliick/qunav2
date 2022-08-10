import Recommendation from "../../../../models/Recommendation";

const Procyon = require('procyon')

export async function rebuildmatrix(message: any) {

    if (message.author.id != "203932549746130944") {
        message.reply("Rlly hope you know what ur doing.");
        return;
    }

    var procyon: any = new Procyon({
        className: 'maps'
    });

    let reccommendation = await Recommendation.find({});
    for (let rec of reccommendation) {
        for (let user of rec.upvote) {
            await procyon.liked(user, rec.id)
        }
        for (let user of rec.downvote) {
            await procyon.disliked(user, rec.id)
        }
    }

    message.reply("Rebuild Redis");

}