import mongoose from "mongoose";
import mongooseLong from 'mongoose-long';

mongooseLong(mongoose);

const ScoreSchema = new mongoose.Schema({
    osuid: Number,
    mapid: Number,
    checksum: String,
    mods: Array,
    rank: String,
    score: {type: mongoose.Schema.Types.Long, min: 0},
    pp: Number,
    accuracy: Number,
    max_combo: Number,
    statistics: Object,
    created_at: Date,
    mode: String,
    mode_int: Number,
});

ScoreSchema.index({ pp: -1});
ScoreSchema.index({ osuid: -1, pp: -1});

export default mongoose.model("score", ScoreSchema);