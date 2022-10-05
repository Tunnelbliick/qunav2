import mongoose from "mongoose";

const OwcSchema = new mongoose.Schema({
    year: String,
    tournamentid: String,
    url: String,
    live_image_url: String,
    full_challonge_url: String,
});

export default mongoose.model("owc", OwcSchema);