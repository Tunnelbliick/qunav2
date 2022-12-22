import { ObjectId } from "mongoose"
import { User } from "./User"

export interface OwcBet {
    id: ObjectId,
    owc: ObjectId
    score1: number,
    score2: number,
    firstto: number,
    lastchanged: Date,
    winner: ObjectId
    user: User
}