import mongoose from "mongoose";
import mongooseLong from 'mongoose-long';

mongooseLong(mongoose);

const ScoreSchema = new mongoose.Schema({
    osuid: Number,
    mapid: Number,
    checksum: String,
    mods: Array,
    rank: String,
    score: { type: mongoose.Schema.Types.Long, min: 0 },
    pp: Number,
    accuracy: Number,
    max_combo: Number,
    statistics: Object,
    created_at: Date,
    mode: String,
    mode_int: Number,
});

ScoreSchema.index({ score: 1 });
ScoreSchema.index({ pp: 1 });
ScoreSchema.index({ osuid: 1, pp: 1 });
ScoreSchema.index({ mapid: 1, pp: 1 });
ScoreSchema.index({ mapid: 1, score: 1 });
ScoreSchema.index({ mapid: 1, score: 1, mods: 1 });
ScoreSchema.index({ mapid: 1, score: 1, mods: 1 });
ScoreSchema.index({ mapid: 1, score: 1, pp: 1 });
ScoreSchema.index({ osuid: 1, mapid: 1, checksum: 1, mods: 1, mode_int: 1 });

export default mongoose.model("score", ScoreSchema);