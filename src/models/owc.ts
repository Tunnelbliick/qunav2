import mongoose from "mongoose";

const OwcSchema = new mongoose.Schema({
    name: String,
    mode: String,
    keys: String,
    year: String,
    size: Number,
    tournamentid: String,
    url: String,
    live_image_url: String,
    full_challonge_url: String,
    tournament_type: String,
    state: String,
    current_round: Number,
});

export default mongoose.model("owc", OwcSchema);