import mongoose from "mongoose";
import { QunaUser } from "../interfaces/qunaUser";

const UserSchema = new mongoose.Schema({
    status: String,
    requesttime: Date,
    validStatus: Boolean,
    creationDate: Date,
    discordid: String,
    username: String,
    userid: String,
    akatsuki: String,
    linksucess: Boolean,
    notification: Boolean,
    timezone: String,
});

export default mongoose.model<QunaUser>("user", UserSchema);