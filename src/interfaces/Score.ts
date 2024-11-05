import { ObjectId } from "mongoose";

export interface Score {
    id: ObjectId,
    osuid: number,
    mapid: number,
    checksum: string,
    mods: Array<string>,
    rank: string,
    score: number,
    pp: number,
    accuracy: number,
    max_combo: number,
    max_pp: number,
    statistics: Object,
    ended_at: Date,
    mode: string,
    mode_int: number,
}