import Recommendation from "../../../../models/Recommendation";

const Procyon = require('procyon')

export async function rebuildmatrix(message: any) {

    if (message.author.id != "203932549746130944") {
        message.reply("Rlly hope you know what ur doing.");
        return;
    }

    let procyon: any = new Procyon({
        className: 'maps'
    });

    const reccommendation = await Recommendation.find({});
    for (const rec of reccommendation) {
        for (const user of rec.upvote) {
            await procyon.liked(user, rec.id)
        }
        for (const user of rec.downvote) {
            await procyon.disliked(user, rec.id)
        }
    }

    message.reply("Rebuild Redis");

}