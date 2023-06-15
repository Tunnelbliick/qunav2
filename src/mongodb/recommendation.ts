import mongoose from "mongoose";
import { Recommendation } from "../interfaces/osu/recommend/recommendation";

const RecommendationSchema = new mongoose.Schema<Recommendation>({
    osuid: Number,
    mapid: String,
    title: String,
    artist: String,
    version: String,
    creator: String,
    cover: String,
    mode: String,
    maxCombo: Number,
    mods: Array,
    drain: Number,
    length: Number,
    acc95: Number,
    acc97: Number,
    acc99: Number,
    acc100: Number,
    ar: Number,
    od: Number,
    cs: Number,
    hp: Number,
    bpm: Number,
    star: Number,
    score: Number,
});

export default mongoose.model<Recommendation>("recommendation", RecommendationSchema);