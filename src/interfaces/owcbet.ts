import { ObjectId } from "mongoose"
import { User } from "./User"

export interface OwcBet {
    id: ObjectId,
    owc: ObjectId
    score1: Number,
    score2: Number,
    firstto: Number,
    lastchanged: Date,
    winner: ObjectId
    user: User
}