import mongoose from "mongoose";
import { PickemPrediction } from "../interfaces/mongodb/pickemPredictions";

const pickemPredictionSchema = new mongoose.Schema({
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'pickemRegistration' },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'owcgame' },
    score: String,
    team1_score: Number,
    team2_score: Number,
    winner_index: Number,
    calculated: Boolean,
});

export default mongoose.model<PickemPrediction>("pickemPrediction", pickemPredictionSchema);