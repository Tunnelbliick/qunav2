import mongoose from "mongoose";

const pcikemRegistrationSchema = new mongoose.Schema({
    owc: {type: mongoose.Schema.Types.ObjectId, ref: 'owc'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    total_score: Number
});

export default mongoose.model("pickemRegistration", pcikemRegistrationSchema);