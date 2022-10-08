import { Int32 } from "mongodb";
import mongoose from "mongoose";

const owcgameSchema = new mongoose.Schema({
    matchid: Number,
    state: String,
    owc: {type: mongoose.Schema.Types.ObjectId, ref: 'owc'},
    score: String,
    firstto: Number,
    date: Date,
    round: Number,
    isLooser: Boolean,
    isWinner: Boolean,
    team1: { type: mongoose.Schema.Types.ObjectId, ref: 'owcteam' },
    team1_score: Number,
    team1_name: String,
    team2: { type: mongoose.Schema.Types.ObjectId, ref: 'owcteam' },
    team2_score: Number,
    team2_name: String,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'owcteam' },
    winner_name: String,
    looser: { type: mongoose.Schema.Types.ObjectId, ref: 'owcteam' },
    looser_name: String,
    winner_index: Number,
    data: Object,
});

export default mongoose.model("owcgame", owcgameSchema);