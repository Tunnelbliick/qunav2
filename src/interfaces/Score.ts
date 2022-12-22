import { ObjectId } from "mongoose";

export interface Score {
    id: ObjectId,
    osuid: Number,
    mapid: Number,
    checksum: String,
    mods: Array<String>,
    rank: String,
    score: Number,
    pp: Number,
    accuracy: Number,
    max_combo: Number,
    max_pp: Number,
    statistics: Object,
    created_at: Date,
    mode: String,
    mode_int: Number,
}