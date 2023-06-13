import { ObjectId } from "mongoose"
import { QunaUser } from "./qunaUser"

export interface OwcBet {
    id: ObjectId,
    owc: ObjectId
    score1: number,
    score2: number,
    firstto: number,
    lastchanged: Date,
    winner: ObjectId
    user: QunaUser
}