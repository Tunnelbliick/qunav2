import { ObjectId } from "mongoose";

export interface Owc {
    id: ObjectId,
    name: string,
    mode: string,
    keys: string,
    year: string,
    size: number,
    tournamentid: string,
    url: string,
    live_image_url: string,
    full_challonge_url: string,
    tournament_type: string,
    state: string,
    current_round: number,
    locked_round: Array<string>,
    locked_matches: Array<string>,
}