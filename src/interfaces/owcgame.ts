import { ObjectId } from "mongoose";

export interface OwcGame {
    id: ObjectId,
    matchid: Number,
    state: String,
    owc: ObjectId,
    score: String,
    firstto: Number,
    date: Date,
    round: Number,
    isLooser: Boolean,
    isWinner: Boolean,
    team1: ObjectId
    team1_score: Number,
    team1_name: String,
    team2: ObjectId,
    team2_score: Number,
    team2_name: String,
    winner: ObjectId,
    winner_name: String,
    looser: ObjectId,
    looser_name: String,
    winner_index: Number,
    data: Object,
}