import mongoose from "mongoose";
import { Pool } from "../interfaces/osu/tournament/pool";

const PoolSchema = new mongoose.Schema({
    round: String,
    mode: String,
    keys: String,
    year: String,
    pool: Object,
});

export default mongoose.model<Pool>("pool", PoolSchema);