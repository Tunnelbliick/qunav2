import { CommandInteractionOptionResolver } from "discord.js";
import { RecentPlayFilter } from "../../../../models/RecentPlayFilter";
import { buildUsernameOfArgs } from "../../../../utility/buildusernames";
import { parseModString } from "../../../osu/utility/parsemods";

export function builFilter(message: any, args: any, default_mode: any) {

    let mode = "";
    let search = "";
    let offset = 0;
    const mods = [];
    let rank = "";
    const usernameargs = [];
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

    const username = buildUsernameOfArgs(usernameargs);

    const filter: RecentPlayFilter = new RecentPlayFilter;
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

export function optionsToFilter(interaction: any, default_mode: any) {
    const filter: RecentPlayFilter = new RecentPlayFilter;

    const options = interaction.options;

    filter.mode = options.getString("mode") === null ? default_mode : options.getString("mode")!;
    filter.mods = options.getString("mods") === null ? [] : parseModString(options.getString("mods"));
    filter.search = options.getString("query") === null ? "" : options.getString("query")?.toLowerCase()!;
    filter.offset = options.getNumber("index") === null ? 0 : options.getNumber("index")! - 1;
    filter.rank = options.getString("rank") === null ? "" : options.getString("rank")?.toLowerCase()!;
    filter.include_fails = options.getNumber("fails") === null ? 1 : options.getNumber("fails")!;
    filter.discordid = options.getMember("discord") === null ? interaction.user.id : options.getMember("discord")?.toString()!;
    filter.username = options.getString("username") === null ? "" : options.getString("username")!;

    if (filter.discordid) {
        filter.discordid = filter.discordid.replace("<@", "").replace(">", "");
    }

    return filter;
}