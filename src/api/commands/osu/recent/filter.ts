import { RecentPlayFilter } from "../../../../models/RecentPlayFilter";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";

export function builFilter(message: any, args: any, default_mode: any) {

    let mode = "";
    let search = "";
    let offset = 0;
    let mods = [];
    let rank = "";
    let usernameargs = [];
    let discordid = message.author.id;
    let include_fails = 1;
    let gamemode = default_mode;

    let arg_index = 0;

    for (let arg of args) {

        arg = arg.toLowerCase();

        if (arg.startsWith("<@")) {
            discordid = args[0].replace("<@", "").replace(">", "");
        }
        else if (arg == "-g" || arg == "-gamemode" || arg == "g" || arg == "gamemode" || arg == "mode" || arg == "-mode") {
            mode = "gamemode";
            continue;
        }
        else if (arg == "-f" || arg == "-fail" || arg == "f" || arg == "fail") {
            mode = "fail";
            continue;
        }
        else if (arg == "-s" || arg == "-search" || arg == "s" || arg == "search") {
            mode = "search";
            continue;
        }
        else if (arg == "-m" || arg == "-mods" || arg == "m" || arg == "mods") {
            mode = "mods";
            continue;
        }
        else if (arg == "-r" || arg == "-rank" || arg == "r" || arg == "rank") {
            mode = "rank";
            continue;
        }

        if (arg_index == 0 && mode == "") {
            if (!isNaN(+arg)) {
                if (+arg <= 50) {
                    offset = +arg;
                    continue;
                }
            }
        }

        if (mode == "") {
            usernameargs.push(arg);
        }

        else if (mode == "fail") {
            if (arg == "true") {
                include_fails = 1;
            }
            if (arg == "false") {
                include_fails = 0;
            }
        }
        else if (mode == "gamemode") {
            gamemode = arg;
        }
        else if (mode == "search") {
            search += arg;
        }
        else if (mode == "mods") {
            mods.push(arg);
        }
        else if (mode == "rank") {
            rank += arg;
        }

        arg_index++;

    }

    let username = buildUsernameOfArgs(usernameargs);

    let filter: RecentPlayFilter = new RecentPlayFilter;
    filter.mode = gamemode;
    filter.mods = mods;
    filter.search = search.toLowerCase();
    filter.offset = offset - 1;
    filter.rank = rank.toLowerCase();
    filter.include_fails = include_fails;
    filter.discordid = discordid;
    filter.username = username;

    return filter;
}