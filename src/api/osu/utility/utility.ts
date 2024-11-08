export function calcRetries(recentplay: Array<any>, mapid: any, mods: any) {
    const trys = recentplay.filter(r => (r.beatmap.id == mapid && arrayEquals(r.mods, mods)))
    return trys.length;
}

export function arrayEquals(a: any, b: any) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export function filterRecent(recentplays: any, filter: any) {
    return recentplays.findIndex((r: any) => {

        const filterresults = [];

        if (filter.search != null && filter.search != "") {
            filterresults.push(r.beatmapset.artist.toLowerCase().includes(filter.search) || r.beatmapset.title.toLowerCase().includes(filter.search) || r.beatmap.version.toLowerCase().includes(filter.search) || r.beatmapset.creator.toLowerCase().includes(filter.search))
        }
        if (filter.mods != null && filter.mods.length != 0) {
            filterresults.push(arrayEquals(r.mods, filter.mods))
        }
        if (filter.rank != null && filter.rank != "") {
            filterresults.push(r.rank.toLowerCase() == filter.rank)
        }

        if (filterresults.length == 0) {
            return true;
        }

        return filterresults.includes(false) == false;
    });
}

export function modeIntToMode(mode_int: number): string {
    let mode = "osu";

    switch (mode_int) {
        case 0:
            return "osu";
        case 1:
            return "taiko";
        case 2:
            return "fruits";
        case 3:
            return "mania";
    }

    return mode;
}