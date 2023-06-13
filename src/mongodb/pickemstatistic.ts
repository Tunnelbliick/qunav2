import mongoose from "mongoose";
import { PickemStatistics } from "../interfaces/osu/tournament/pickem/pickemStatistics";

const pickemStatistics = new mongoose.Schema({
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'owcgame' },
    team1: Number,
    team2: Number
});

export default mongoose.model<PickemStatistics>("pickemstatistics", pickemStatistics);