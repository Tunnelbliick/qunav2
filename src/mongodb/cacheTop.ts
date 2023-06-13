import mongoose from "mongoose";
import { Top } from "../interfaces/osu/top/top";

const cacheTopSchema = new mongoose.Schema<Top>({
    osuid: Number,
    mode: String,
    topData: Array,
});

export default mongoose.model<Top>("cacheTop", cacheTopSchema);