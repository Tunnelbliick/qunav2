import { TopPlaysfilter } from "../../../../models/TopPlaysfilter";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { parseModString } from "../../../osu/utility/parsemods";

export function buildFilter(interaction: any, message: any, args: any, default_mode: any) {

    let mode = "";
    let search = "";
    let offset = 0;
    let mods = "";
    const rank = [];
    const usernameargs = [];
    let discordid = undefined;
    let gamemode = default_mode;
    let arg_index = 0;
    const acc = [];
    const combo = [];
    let sort = "position";
    let reverse = false;

    if (interaction) {
        discordid = interaction.user.id;
        const options = interaction.options;

        discordid = options.getMember("discord") === null ? interaction.user.id : options.getMember("discord")?.toString()!;
        usernameargs.push(options.getString("username") === null ? "" : options.getString("username")!);
        gamemode = options.getString("mode") === null ? default_mode : options.getString("mode")!;
        search = options.getString("search") === null ? "" : options.getString("search")!;
        mods = options.getString("mods") === null ? "" : options.getString("mods")!;
        let acc_string = options.getString("accuracy") === null ? "" : options.getString("accuracy")!;
        if (acc_string !== "")
            acc.push(...acc_string.split("-"));
        let combo_string = options.getString("combo") === null ? "" : options.getString("combo")!;
        if (combo_string !== "")
            combo.push(...combo_string.split("-"));
        let rank_sring = options.getString("rank") === null ? "" : options.getString("rank")!;
        if (rank_sring !== "")
            rank.push(rank_sring);
        sort = options.getString("sort") === null ? "position" : options.getString("sort")!;
        reverse = options.getBoolean("reverse") === null ? false : options.getBoolean("reverse")!;

    } else {

        discordid = message.author.id;

        for (let arg of args) {

            arg = arg.toLowerCase();

            if (arg.startsWith("<@")) {
                discordid = arg.replace('<@', '').replace('>', '');
                continue;
            } else if (["-g", "-gamemode", "g", "gamemode"].includes(arg)) {
                mode = "gamemode";
                continue;
            }
            else if (["-s", "-search", "s", "search"].includes(arg)) {
                mode = "search";
                continue;
            }
            else if (["-m", "-mods", "m", "mods"].includes(arg)) {
                mode = "mods";
                continue;
            }
            else if (["-c", "-combo", "c"].includes(arg) || (arg_index != 0 && args[arg_index - 1] != "sort" && arg == "combo")) {
                mode = "combo";
                continue;
            }
            else if (["-a", "-acc"].includes(arg) || (arg == "a" && mode != "rank") || (arg_index != 0 && args[arg_index - 1] != "sort" && arg == "acc")) {
                mode = "acc";
                continue;
            }
            else if (["-r", "-rank", "rank", "r"].includes(arg)) {
                mode = "rank";
                continue;
            }
            else if (["-sort", "sort"].includes(arg)) {
                mode = "sort";
                continue;
            }
            else if (["-reverse", "reverse", "rev", "-rev"].includes(arg)) {
                mode = "reverse";
                continue;
            }

            if (arg_index == 0 && mode == "") {
                if (!isNaN(+arg)) {
                    if (+arg <= 100) {
                        offset = +arg;
                        continue;
                    }
                }
            }

            switch (mode) {
                default:
                    usernameargs.push(arg);
                    break;
                case "gamemode":

                    if (["catch", "ctb"].includes(arg)) {
                        gamemode = "fruits"
                    } else {
                        gamemode = arg;
                    }
                    break;
                case "search":
                    if(search === "")
                    search += arg.toLowerCase();
                    else 
                    search += " " + arg.toLowerCase();
                    break;
                case "mods":
                    mods += arg;
                    break;
                case "combo":
                    combo.push(arg);
                    break;
                case "acc":
                    acc.push(arg);
                    break;
                case "rank":
                    if (arg.toLowerCase() == "ss") {
                        rank.push("x");
                        rank.push("xh")
                    } else
                        rank.push(arg);
                    break;
                case "sort":
                    sort = arg;
                    break;
                case "reverse":
                    if (arg == "true") {
                        reverse = true;
                    }
                    else if (arg == "false") {
                        reverse = false;
                    }
                    break;
            }

            arg_index++;

        }
    }

    const username = buildUsernameOfArgs(usernameargs);

    const filter: TopPlaysfilter = new TopPlaysfilter();
    filter.gamemode = gamemode;
    filter.search = search;
    filter.mods = parseModString(mods);
    filter.combo = combo;
    filter.acc = acc;
    filter.rank = rank;
    filter.sort = sort;
    filter.reverse = reverse;
    filter.offset = offset - 1;
    filter.discordid = discordid;
    filter.username = username;

    return filter;

}