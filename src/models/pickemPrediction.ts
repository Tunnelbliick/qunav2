import mongoose from "mongoose";

const pickemPredictionSchema = new mongoose.Schema({
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'pickemRegistration' },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'owcgame' },
    score: String,
    team1_score: Number,
    team2_score: Number
});

export default mongoose.model("pickemPrediction", pickemPredictionSchema);