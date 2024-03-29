import { Decimal128, ReplaceOneModel } from "mongodb";
import mongoose from "mongoose";
import { RecommendationInfo } from "../interfaces/RecommendationInfo";

const RecommendationInfoSchema = new mongoose.Schema<RecommendationInfo>({
    osuid: Number,
    currentIndex: Number,
    length: Number,
    createdAt: Date,
    mods: Array,
});

export default mongoose.model<RecommendationInfo>("recommendationInfo", RecommendationInfoSchema);