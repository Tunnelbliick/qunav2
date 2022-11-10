import score from "../../models/score";

export async function loadUnrankedTop(user_id: any, mode: any) {

    const returnArray: object[] = [];

    if (isNaN(user_id))
        return [];

    const userid = +user_id;

    const top100: object[] = await score.find({
        osuid: userid,
        mode: mode,
        pp: { $lte: 2000 }
    }).sort({ pp: -1 }).limit(100).exec();

    top100.forEach((top: any) => {

        top.beatmap = { id: top.mapid, checksum: top.checksum }

        returnArray.push(top);

    })

    return returnArray;

}