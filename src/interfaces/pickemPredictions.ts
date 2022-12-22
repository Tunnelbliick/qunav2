import { ObjectId } from "mongoose";

export interface PickemPrediction {
    id: ObjectId,
    registration: ObjectId,
    match: ObjectId,
    score: string,
    team1_score: number,
    team2_score: number,
    winner_index: number,
    calculated: boolean,
}