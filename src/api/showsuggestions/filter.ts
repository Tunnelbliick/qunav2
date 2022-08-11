export interface suggestion_filter {
    ar: any,
    cs: any,
    od: any,
    hp: any,
    bpm: any,
    star: any,
    searchString: string,
    username?: any
    userid?: any,
}

export function filterRecommends(args: any) {
    let searchString = "";
    let mode = "";
    let ar: any = [];
    let cs: any = [];
    let od: any = [];
    let hp: any = [];
    let bpm: any = [];
    let star: any = [];
    let usernameargs: any;

    for (let arg of args) {

        if (arg == "-s") {
            mode = "SEARCHSTRING";
            continue;
        }

        if (arg == "-ar") {
            mode = "AR";
            continue;
        }

        if (arg == "-cs") {
            mode = "CS";
            continue;
        }

        if (arg == "-od") {
            mode = "OD";
            continue;
        }

        if (arg == "-hp") {
            mode = "HP";
            continue;
        }

        if (arg == "-bpm") {
            mode = "BPM";
            continue;
        }

        if (arg == "-d") {
            mode = "STAR";
            continue;
        }

        if (mode == "")
            usernameargs.push(arg);

        if (mode == "SEARCHSTRING")
            searchString += arg;

        if (mode == "AR")
            ar.push(arg);

        if (mode == "CS")
            cs.push(arg)

        if (mode == "OD")
            od.push(arg)

        if (mode == "HP")
            hp.push(arg)

        if (mode == "BPM")
            bpm.push(arg)

        if (mode == "STAR")
            star.push(arg)
    }

    let filter: suggestion_filter = {
        ar: ar,
        bpm: bpm,
        cs: cs,
        hp: hp,
        od: od,
        searchString: searchString,
        username: usernameargs,
        star: star
    }

    return filter;
}