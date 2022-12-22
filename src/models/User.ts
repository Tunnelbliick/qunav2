import mongoose from "mongoose";
import { User } from "../interfaces/User";

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

export default mongoose.model<User>("user", UserSchema);