import mongoose from "mongoose";
import { like } from "../interfaces/Like";

const dislike = new mongoose.Schema({
    osuid: Number,
    beatmapid: Number
});

export default mongoose.model<like>("dislike", dislike);