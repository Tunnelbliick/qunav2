import mongoose from "mongoose";
import { Beatmap } from "../interfaces/osu/beatmap/beatmap";

const BeatmapSchema = new mongoose.Schema({
    mapid: String,
    checksum: String,
    beatmap: Object
});

export default mongoose.model<Beatmap>("beatmap", BeatmapSchema);