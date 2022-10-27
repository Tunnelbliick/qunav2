import score from "../../models/score";

export async function loadUnrankedScore(user_id: any, mapid: any, mode: any) {

    if (isNaN(user_id))
        return undefined;

    const userid = +user_id;

    const saved_score = await score.find({
        osuid: userid,
        mapid: mapid,
        mode_int: mode
    });

    return { scores: saved_score };

}