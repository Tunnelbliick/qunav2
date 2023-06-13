import { ObjectId } from "mongoose";
import { challongeGame } from "./challongeGame";

export interface OwcGame {
    id: ObjectId,
    matchid: number,
    state: string,
    owc: ObjectId,
    score: string,
    firstto: number,
    date: Date,
    round: number,
    isLooser: boolean,
    isWinner: boolean,
    team1: ObjectId
    team1_score: number,
    team1_name: string,
    team2: ObjectId,
    team2_score: number,
    team2_name: string,
    winner: ObjectId,
    winner_name: string,
    looser: ObjectId,
    looser_name: string,
    winner_index: number,
    data: challongeGame,
}