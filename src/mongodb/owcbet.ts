import mongoose from "mongoose";
import { OwcBet } from "../interfaces/mongodb/owcbet";
import owc from "./owc";
import User from "./user";

const owcgameSchema = new mongoose.Schema({
    owc: {type: mongoose.Schema.Types.ObjectId, ref: 'owc'},
    score1: Number,
    score2: Number,
    firstto: Number,
    lastchanged: Date,
    winner: {type: mongoose.Schema.Types.ObjectId, ref: 'owcteam'},
    user: User
});

export default mongoose.model<OwcBet>("owcgame", owcgameSchema);