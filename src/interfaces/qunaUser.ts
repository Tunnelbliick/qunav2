import { ObjectId } from "mongoose";

export interface QunaUser {
    id: ObjectId,
    status: string,
    requesttime: Date,
    validStatus: boolean,
    creationDate: Date,
    discordid: string,
    username: string,
    akatsuki: string,
    userid: string,
    linksucess: boolean,
    notification: boolean,
    timezone: string,
}