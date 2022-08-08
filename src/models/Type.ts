import mongoose from "mongoose";

const TypeSchema = new mongoose.Schema({
    name: String
});

export default mongoose.model("type", TypeSchema);