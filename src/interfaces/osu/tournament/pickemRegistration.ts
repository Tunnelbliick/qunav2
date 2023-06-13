import { ObjectId } from "mongoose"

export interface PickemRegistration {
    id: ObjectId,
    owc: ObjectId,
    user: ObjectId,
    total_score: number,
}