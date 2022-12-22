import { ObjectId } from "mongoose";

export interface User {
    id: ObjectId,
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
}