import { ObjectId } from "mongoose";
export interface Pool {
    id: ObjectId,
    round: string,
    mode: string,
    keys: string,
    year: string,
    pool: Map<string, string[]>,
}