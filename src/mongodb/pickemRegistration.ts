import mongoose from "mongoose";
import { PickemRegistration } from "../interfaces/mongodb/pickemRegistration";

const pcikemRegistrationSchema = new mongoose.Schema({
    owc: { type: mongoose.Schema.Types.ObjectId, ref: 'owc' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    total_score: { type: Number, index: true }
});

export default mongoose.model<PickemRegistration>("pickemRegistration", pcikemRegistrationSchema);