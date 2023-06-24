import { OsuScore } from "../../interfaces/osu/score/osuScore";
import { RecentPlayArguments } from "../osu/recent/recent";

export function calcRetries(plays: OsuScore[], mapid: number, mods: string[]) {
    const trys = plays.filter(r => (r.beatmap.id == mapid && arrayEquals(r.mods, mods)))
    return trys.length;
}

export function arrayEquals(a: Array<unknown>, b: Array<unknown>) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export function filterRecent(plays: OsuScore[], filter: RecentPlayArguments) {
    return plays.findIndex((r: OsuScore) => {

        const filterresults = [];

        if (filter.search != null && filter.search != "") {
            filterresults.push(r.beatmapset.artist.toLowerCase().includes(filter.search) || r.beatmapset.title.toLowerCase().includes(filter.search) || r.beatmap.version.toLowerCase().includes(filter.search) || r.beatmapset.creator.toLowerCase().includes(filter.search))
        }
        if (filter.mods != null && filter.mods.length != 0) {
            filterresults.push(arrayEquals(r.mods, filter.mods))
        }
        if (filter.rank != null && filter.rank != "") {
            if (r.rank !== undefined)
                filterresults.push(r.rank.toLowerCase() == filter.rank)
        }

        if (filterresults.length == 0) {
            return true;
        }

        return filterresults.includes(false) == false;
    });
}