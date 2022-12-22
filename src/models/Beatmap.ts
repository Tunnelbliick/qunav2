import mongoose from "mongoose";
import { Beatmap } from "../interfaces/Beatmap";

const BeatmapSchema = new mongoose.Schema({
    mapid: String,
    checksum: String,
    beatmap: Object
});

export default mongoose.model<Beatmap>("beatmap", BeatmapSchema);