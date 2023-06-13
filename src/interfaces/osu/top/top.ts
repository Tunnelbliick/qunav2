export interface Top {
    osuid: number,
    mode: string,
    topData: Array<TopData>,
}

export interface TopData {
    index: number,
    scoreid: number,
    pp: string,
    score: string,
    mode: string,
    mods: Array<string>,
    beatmapid: number,
}

export class TopPlaysfilter {
    gamemode: string = "";
    search: string = "";
    offset: number = 0;
    mods: Array<string> = [];
    rank: Array<string> = [];
    combo: Array<string> = [];
    acc: Array<string> = [];
    sort: string = "position";
    reverse: boolean = true;
    discordid: string = "";
    username: string = "";
}