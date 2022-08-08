import { Decimal128 } from "mongodb";
import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
    mapid: String,
    recommendedby: String,
    title: String,
    artist: String,
    version: String,
    creator: String,
    cover: String,
    upvote: Array,
    downvote: Array,
    mods: Array,
    type: Array,
    drain: Number,
    length: Number,
    circles: Number,
    sliders: Number,
    spinners: Number,
    ar: Decimal128,
    od: Decimal128,
    cs: Decimal128,
    hp: Decimal128,
    bpm: Decimal128,
    star: Decimal128,
});

export default mongoose.model("recommendation", RecommendationSchema);