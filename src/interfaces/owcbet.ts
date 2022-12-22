import { ObjectId } from "mongoose"
import { Quna_User } from "./QunaUser"

export interface OwcBet {
    id: ObjectId,
    owc: ObjectId
    score1: number,
    score2: number,
    firstto: number,
    lastchanged: Date,
    winner: ObjectId
    user: Quna_User
}