import mongoose from "mongoose";

const UserHashSchema = new mongoose.Schema({
    osuid: Number,
    topHash: String,
    pinnedHash: String,
    favoriteHash: String,
});

export default mongoose.model("userHash", UserHashSchema);