import { ObjectId } from "mongoose"

export interface PickemStatistics {
    id: ObjectId,
    match: ObjectId,
    team1: Number,
    team2: Number
}