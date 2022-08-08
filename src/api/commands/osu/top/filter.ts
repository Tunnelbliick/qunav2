import { TopPlaysfilter } from "../../../../models/TopPlaysfilter";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { parseModString } from "../../../osu/utility/parsemods";

export function buildFilter(message: any, args: any, default_mode: any) {

    let mode = "";
    let search = "";
    let offset = 0;
    let mods = "";
    let rank = [];
    let usernameargs = [];
    let discordid = message.author.id;
    let gamemode = default_mode;
    let arg_index = 0;
    let acc = [];
    let combo = [];
    let sort = "position";
    let reverse = false;

    for (let arg of args) {

        arg = arg.toLowerCase();

        if (arg.startsWith("<@")) {
            discordid = arg.replace('<@', '').replace('>', '');
            continue;
        }
        else if (arg == "-g" || arg == "-gamemode" || arg == "g" || arg == "gamemode") {
            mode == "gamemode";
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
        else if (arg == "-c" || arg == "-combo" || arg == "c" || (arg_index != 0 && args[arg_index - 1] != "sort" && arg == "combo")) {
            mode = "combo";
            continue;
        }
        else if (arg == "-a" || arg == "-acc" || (arg == "a" && mode != "rank") || (arg_index != 0 && args[arg_index - 1] != "sort" && arg == "acc")) {
            mode = "acc";
            continue;
        }
        else if (arg == "-r" || arg == "-rank" || arg == "rank" || arg == "r") {
            mode = "rank";
            continue;
        }
        else if (arg == "-sort" || arg == "sort") {
            mode = "sort";
            continue;
        }
        else if (arg == "-reverse" || arg == "reverse" || arg == "rev" || arg == "-rev") {
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

        if (mode == "") {
            usernameargs.push(arg);
        }
        else if (mode == "gamemode") {
            gamemode = arg;
        }
        else if (mode == "search") {
            search += arg;
        }
        else if (mode == "mods") {
            mods += arg;
        }
        else if (mode == "combo") {
            combo.push(arg);
        }
        else if (mode == "acc") {
            acc.push(arg);
        }
        else if (mode == "rank") {
            if (arg.toLowerCase() == "ss") {
                rank.push("x");
                rank.push("xh")
            } else
                rank.push(arg);
        }
        else if (mode == "sort") {
            sort = arg;
        }
        else if (mode == "reverse") {
            if (arg == "true") {
                reverse = true;
            }
            else if (arg == "false") {
                reverse = false;
            }
        }

        arg_index++;

    }

    let username = buildUsernameOfArgs(usernameargs);

    let filter: TopPlaysfilter = new TopPlaysfilter();
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