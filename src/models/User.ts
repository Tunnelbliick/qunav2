import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    status: String,
    requesttime: Date,
    validStatus: Boolean,
    creationDate: Date,
    discordid: String,
    username: String,
    userid: String,
    linksucess: Boolean,
    timezone: String,
});

export default mongoose.model("user", UserSchema);