import { ObjectId } from "mongoose"

export interface PickemStatistics {
    id: ObjectId,
    match: ObjectId,
    team1: number,
    team2: number
}