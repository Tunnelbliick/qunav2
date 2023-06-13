import { ObjectId } from "mongoose";

export interface Beatmap {
    id: ObjectId
    mapid: string;
    checksum: string;
    beatmap: Object;
}
