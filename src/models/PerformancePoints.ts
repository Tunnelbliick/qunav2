import mongoose from "mongoose";
import { PerformancePoints } from "../interfaces/performancePoints";

const PerformancePointsSchema = new mongoose.Schema({
    mapid: String,
    checksum: String,
    mode: String,
    mods: Array,
    pp: Object,
    difficulty: Object,
    graph: Object
});

export default mongoose.model<PerformancePoints>("performancepoints", PerformancePointsSchema);