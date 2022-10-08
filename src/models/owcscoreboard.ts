import { Int32 } from "mongodb";
import mongoose from "mongoose";
import owc from "./owc";
import User from "./User";

const owcscoreboardSchema = new mongoose.Schema({
    owc: owc,
    user: User,
    points: Number
});

export default mongoose.model("owcscoreboard", owcscoreboardSchema);