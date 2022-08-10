import { getDifficultyColor } from "../../utility/gradiant";

export interface BeatmapStats {
    cs: any,
    hp: any,
    bpm: any,
    mapLength: any,
    mapDrain: any,
    min?: any,
    strSec?: any,
    dmin?: any,
    strDsec?: any,
    color?: any,
}

export function calcualteStatsFromBeatmapforMods(beatmap: any, mods: Array<string>) {

    let stats: BeatmapStats = {
        cs: beatmap.cs,
        hp: beatmap.hp,
        bpm: beatmap.beatmapset.bpm,
        mapLength: beatmap.total_length,
        mapDrain: beatmap.hit_length
    }

    return calcualteStatsforMods(stats, mods);

}

export function calcualteStatsforMods(stats: BeatmapStats, mods: Array<string>) {

    if (mods.includes("EZ")) {
        stats.cs = stats.cs * 0.5
        stats.hp = stats.hp * 0.5
    }
    if (mods.includes("HR")) {
        stats.cs = stats.cs * 1.3;
        stats.hp = stats.hp * 1.4;
    }

    if (mods.includes("DT") || mods.includes("NC")) {
        stats.bpm = Math.round(stats.bpm * 1.5);
        stats.mapLength = stats.mapLength / 1.5
        stats.mapDrain = stats.mapDrain / 1.5
    }
    if (mods.includes("HT")) {
        stats.bpm = Math.round(stats.bpm * 0.75);
        stats.mapLength = stats.mapLength / 0.75
        stats.mapDrain = stats.mapDrain / 0.75
    }

    if (stats.cs > 10) {
        stats.cs = 10;
    }

    if (stats.hp > 10) {
        stats.hp = 10;
    }

    stats.min = Math.floor(stats.mapLength / 60)
    let sec = Math.floor(stats.mapLength - stats.min * 60)
    stats.strSec = sec.toFixed(0).toString()
    if (sec < 10) { stats.strSec = "0" + sec }

    stats.dmin = Math.floor(stats.mapDrain / 60)
    let dsec = Math.floor(stats.mapDrain - stats.dmin * 60)
    stats.strDsec = dsec.toFixed(0).toString()
    if (dsec < 10) { stats.strDsec = "0" + dsec }

    return stats;

}