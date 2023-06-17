import mongoose from "mongoose";
import { UserHash } from "../interfaces/userHash";

const UserHashSchema = new mongoose.Schema({
    osuid: Number,
    mode: String,
    topHash: String,
    pinnedHash: String,
    favoriteHash: String,
    updating: Boolean,
});

export default mongoose.model<UserHash>("userHash", UserHashSchema);