import { ObjectId } from "mongoose";

export interface Owc {
    id: ObjectId,
    name: String,
    mode: String,
    keys: String,
    year: String,
    size: Number,
    tournamentid: String,
    url: String,
    live_image_url: String,
    full_challonge_url: String,
    tournament_type: String,
    state: String,
    current_round: Number,
    locked_round: Array<string>,
    locked_matches: Array<string>,
}