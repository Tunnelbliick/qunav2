import mongoose from "mongoose";
import qunaUser from "./qunaUser";
import { OwcBet } from "../interfaces/osu/tournament/owcbet";

const owcgameSchema = new mongoose.Schema({
    owc: {type: mongoose.Schema.Types.ObjectId, ref: 'owc'},
    score1: Number,
    score2: Number,
    firstto: Number,
    lastchanged: Date,
    winner: {type: mongoose.Schema.Types.ObjectId, ref: 'owcteam'},
    user: qunaUser
});

export default mongoose.model<OwcBet>("owcgame", owcgameSchema);