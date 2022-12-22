import { ObjectId } from "mongoose";
import { pp } from "./pp";

export interface PerformancePoints {
    id: ObjectId,
    mapid: String,
    checksum: String,
    mode: String,
    mods: Array<String>,
    pp: pp,
    difficulty: Object,
    graph: Object
}