import mongoose from "mongoose";
import { Quna_User } from "../interfaces/QunaUser";

const UserSchema = new mongoose.Schema({
    status: String,
    requesttime: Date,
    validStatus: Boolean,
    creationDate: Date,
    discordid: String,
    username: String,
    userid: String,
    linksucess: Boolean,
    notification: Boolean,
    timezone: String,
});

export default mongoose.model<Quna_User>("user", UserSchema);