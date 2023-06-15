import mongoose from "mongoose";
import { RecommendationInfo } from "../interfaces/osu/recommend/recommendationInfo";

const RecommendationInfoSchema = new mongoose.Schema<RecommendationInfo>({
    osuid: Number,
    currentIndex: Number,
    length: Number,
    createdAt: Date,
    mods: Array,
});

export default mongoose.model<RecommendationInfo>("recommendationInfo", RecommendationInfoSchema);