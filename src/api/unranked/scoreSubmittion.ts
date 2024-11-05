import score from "../../models/score";

export async function saveScore(unranked: any, pp: any, max_pp: any) {

    if(unranked.rank === "F") {
        return;
    }

    const user_id = unranked.user_id;
    const beatmap = unranked.beatmap;

    let saved_score = await score.findOne({ osuid: user_id, mapid: beatmap.id, checksum: beatmap.checksum, mods: unranked.mods, mode_int: unranked.mode_int });

    if (saved_score === null) {

        saved_score = new score();

        saved_score.osuid = user_id;
        saved_score.mapid = beatmap.id;
        saved_score.checksum = beatmap.checksum;
        saved_score.mods = unranked.mods;
        saved_score.rank = unranked.rank;
        saved_score.score = unranked.score;
        saved_score.pp = pp;
        saved_score.accuracy = unranked.accuracy;
        saved_score.max_combo = unranked.max_combo;
        saved_score.statistics = unranked.statistics;
        saved_score.ended_at = unranked.ended_at;
        saved_score.mode = unranked.mode;
        saved_score.mode_int = unranked.mode_int;
        saved_score.max_pp = max_pp;

        return saved_score.save();


    } else {
        if (unranked.score > +saved_score.score!) {

            await score.updateOne({ _id: saved_score.id }, {

                rank: unranked.rank,
                score: unranked.score,
                pp: pp,
                accuracy: unranked.accuracy,
                max_combo: unranked.max_combo,
                statistics: unranked.statistics,
                ended_at: unranked.ended_at,

            })

        }
    }

}