import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: String
});

export default mongoose.model("category", CategorySchema);