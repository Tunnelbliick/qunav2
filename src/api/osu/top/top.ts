import { v2 } from "osu-api-extended";
import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { Best, Top, TopData } from "../../../interfaces/osu/top/top";
import { loadUnrankedTop } from "../../unranked/top";
import { login } from "../../utility/banchoLogin";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { BanchoParams } from "../../../interfaces/arguments";
import userHash from "../../../mongodb/userHash";
import cacheTop from "../../../mongodb/cacheTop";
const makeHash = require("hash-sum")

export async function getTopForUser(userid: number, mode: Gamemode, offset?: string, limit?: string, unranked?: boolean) {

    let bestplays: OsuScore[] = [];

    if (unranked === true) {
        bestplays = await loadUnrankedTop(userid, mode);
    } else {
        bestplays = await loadAndCacheTopFromBancho(bestplays, userid, offset, limit, mode);
    }

    const returnArray: Best[] = [];

    if (bestplays == undefined || bestplays == null) {
        throw new Error("NOPLAYSFOUND")
    }

    bestplays.forEach((play: OsuScore, index: number) => {
        returnArray.push({ position: index, value: play });
    });

    return returnArray;
}

async function loadAndCacheTopFromBancho(bestplays: OsuScore[], userid: number, offset: string | undefined, limit: string | undefined, mode: Gamemode) {
    bestplays = await getBanchoTop(userid, offset, limit, mode);

    let hash = await userHash.findOne({ osuid: userid });

    // If hash is null create new hash
    if (hash === undefined || hash === null) {
        hash = new userHash();
        hash.osuid = userid;
    }

    const topData: TopData[] = [];
    const top: Top = {
        osuid: userid,
        mode: mode,
        topData: topData
    };

    bestplays.forEach((play: OsuScore, index: number) => {

        if (play.mode !== mode) {
            mode = play.mode as Gamemode;
        }

        const data: TopData = {
            index: index,
            scoreid: play.id,
            pp: play.pp.toString(),
            score: play.score.toString(),
            mode: play.mode,
            mods: play.mods,
            beatmapid: play.beatmap.id,
        };

        topData.push(data);
    });

    top.topData = topData;

    const top100String: string[] = top.topData.map((data: TopData) => {
        return `${data.scoreid}`;
    });

    const topHash: string = makeHash(JSON.stringify(top100String));

    if (hash === null || hash.topHash !== topHash || hash.topHash === undefined || hash.topHash === null) {

        const top = new cacheTop();
        top.osuid = userid;
        top.mode = mode;
        top.topData = topData;

        hash.topHash = topHash;

        await top.save();
        await hash.save();

    }
    return bestplays;
}

export async function getBanchoTop(userid: number, offset?: string, limit?: string, mode?: Gamemode): Promise<OsuScore[]> {

    try {
        await login();

        const params: BanchoParams = {
            limit,
            mode,
            offset
        };

        const data: object = await v2.scores.user.category(userid, "best", params);

        if (data.hasOwnProperty("error")) {
            throw new Error("NOTFOUNDID");
        }

        return data as OsuScore[];
    } catch {
        throw new Error("NOSERVER");
    }
}