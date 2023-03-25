import mongoose from "mongoose";

const UserHashSchema = new mongoose.Schema({
    osuid: Number,
    mode: String,
    topHash: String,
    pinnedHash: String,
    favoriteHash: String,
    updating: Boolean,
});

export default mongoose.model("userHash", UserHashSchema);