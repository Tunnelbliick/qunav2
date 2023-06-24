import { OsuBeatmap } from "../beatmap/osuBeatmap";

export interface AkatsukiScore {
    beatmap_id: string,
    score: string,
    maxcombo: string,
    count50: string,
    count100: string,
    count300: string,
    countmiss: string,
    countkatu: string,
    countgeki: string,
    perfect: string,
    enabled_mods: string,
    user_id: string,
    date: string,
    rank: string,
    pp: string,
    beatmap: OsuBeatmap
}