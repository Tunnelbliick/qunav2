import mongoose from "mongoose";

const PoolSchema = new mongoose.Schema({
    round: String,
    mode: String,
    keys: String,
    year: String,
    pool: Object,
});

export default mongoose.model("pool", PoolSchema);