import mongoose from "mongoose";

const BeatmapSchema = new mongoose.Schema({
    mapid: String,
    checksum: String,
    beatmap: Object
});

export default mongoose.model("beatmap", BeatmapSchema);