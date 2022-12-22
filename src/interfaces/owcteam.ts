import { ObjectId } from "mongoose"

export interface OwcTeam {
    id: ObjectId,
    owc: ObjectId,
    challonge_id: Number,
    name: String,
    seed: Number,
    data: Object,
    place: Number,
    mode: String
}