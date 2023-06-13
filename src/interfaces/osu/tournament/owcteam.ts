import { ObjectId } from "mongoose"

export interface OwcTeam {
    id: ObjectId,
    owc: ObjectId,
    challonge_id: number,
    name: string,
    seed: number,
    data: Object,
    place: number,
    mode: string
}