import { ObjectId } from "mongoose";

export interface Beatmap {
    id: ObjectId
    mapid: String;
    checksum: String;
    beatmap: Object;
}
