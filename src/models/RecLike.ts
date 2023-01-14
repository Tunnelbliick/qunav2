import mongoose from "mongoose";
import { like } from "../interfaces/Like";

const likeSchema = new mongoose.Schema({
    osuid: Number,
    beatmapid: Number,
    origin: String,
    mode: String,
    value: String,
    type: String,
});

export default mongoose.model<like>("like", likeSchema);

likeSchema.index({ osuid: 1 });
likeSchema.index({ beatmapid: 1 });
likeSchema.index({ origin: 1 });
likeSchema.index({ value: 1 });
likeSchema.index({ osuid: 1, value: 1, origin: 1 }, { unique: true });