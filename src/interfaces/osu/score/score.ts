import { ObjectId } from "mongoose";

export interface statistics {
    count_100: number;
    count_300: number;
    count_50: number;
    count_geki: number;
    count_katu: number;
    count_miss: number;
}

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
    statistics: statistics,
    created_at: Date,
    mode: string,
    mode_int: number,
}