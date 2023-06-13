import mongoose from "mongoose";
import { OwcTeam } from "../interfaces/mongodb/owcteam";

const owcteamSchema = new mongoose.Schema({
    owc: {type: mongoose.Schema.Types.ObjectId, ref: 'owc'},
    challonge_id: Number,
    name: String,
    seed: Number,
    data: Object,
    place: Number,
    mode: String
});

export default mongoose.model<OwcTeam>("owcteam", owcteamSchema);