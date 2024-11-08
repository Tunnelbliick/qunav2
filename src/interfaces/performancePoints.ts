import { ObjectId } from "mongoose";
import { pp } from "./pp";

export interface PerformancePoints {
    id: ObjectId,
    mapid: string,
    checksum: string,
    mode: number,
    mods: Array<string>,
    pp: pp,
    difficulty: Object,
    graph: Object
}