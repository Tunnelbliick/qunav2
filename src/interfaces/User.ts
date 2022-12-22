import { ObjectId } from "mongoose";

export interface User {
    id: ObjectId,
    status: string,
    requesttime: Date,
    validStatus: boolean,
    creationDate: Date,
    discordid: string,
    username: string,
    userid: string,
    linksucess: boolean,
    notification: boolean,
    timezone: string,
}