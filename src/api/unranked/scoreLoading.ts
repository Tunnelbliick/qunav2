import score from "../../models/score";

export async function loadUnrankedScore(user_id: any, mapid: any, mode: any) {

    if (isNaN(user_id))
        return [];

    const userid = +user_id;

    const saved_scores = await score.find({
        osuid: userid,
        mapid: mapid,
        mode_int: mode
    });

    return saved_scores;

}