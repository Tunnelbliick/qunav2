import mongoose from "mongoose";

const owcteamSchema = new mongoose.Schema({
    owc: {type: mongoose.Schema.Types.ObjectId, ref: 'owc'},
    challonge_id: Number,
    name: String,
    seed: Number,
    data: Object,
    place: Number,
});

export default mongoose.model("owcteam", owcteamSchema);