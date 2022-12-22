import { ObjectId } from "mongoose";
export interface Pool {
    id: ObjectId,
    round: String,
    mode: String,
    keys: String,
    year: String,
    pool: Map<string, string[]>,
}