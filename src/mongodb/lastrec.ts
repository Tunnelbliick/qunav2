import mongoose from "mongoose";

const LastRecommendationSchema = new mongoose.Schema({
    userid: String,
    mongoids: Array,
});

export default mongoose.model("lastrec", LastRecommendationSchema);