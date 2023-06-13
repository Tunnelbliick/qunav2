import mongoose from "mongoose";

const RecommendationListSchema = new mongoose.Schema({
    userid: String,
    mongoids: Array,
});

export default mongoose.model("recList", RecommendationListSchema);