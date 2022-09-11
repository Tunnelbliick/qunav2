import { StringExpression } from "mongoose";

export class RecentPlayFilter {
    search: StringExpression = "";
    offset: number = 0;
    mods: Array<string> = [];
    rank: string = "";
    include_fails: number = 1;
    mode: string = "osu";
    discordid: any;
    username: string = "";
}