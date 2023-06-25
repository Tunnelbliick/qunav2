import { ChatInputCommandInteraction, User } from "discord.js";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { RecentPlayArguments } from "./recent";
import { parseModString } from "../../../utility/parsemods";
import { Server } from "../../../interfaces/enum/server";
import { buildUsernameOfArgs } from "../../utility/buildusernames";

enum LegacyMode {
    None,
    Gamemode,
    Fail,
    Search,
    Mods,
    Rank,
}

type CommandGroup = {
    commands: string[],
    handler: () => LegacyMode,
};

const commandGroups: CommandGroup[] = [
    {
        commands: ["-g", "-gamemode", "g", "gamemode", "mode", "-mode"],
        handler: () => { return LegacyMode.Gamemode },
    },
    {
        commands: ["-f", "-fail", "f", "fail"],
        handler: () => { return LegacyMode.Fail },
    },
    {
        commands: ["-s", "-search", "s", "search"],
        handler: () => { return LegacyMode.Search },
    },
    {
        commands: ["-m", "-mods", "m", "mods"],
        handler: () => { return LegacyMode.Mods },
    },
    {
        commands: ["-r", "-rank", "r", "rank"],
        handler: () => { return LegacyMode.Rank },
    },
];

function buildHandlers(): { [command: string]: () => LegacyMode } {
    const handlers: { [command: string]: () => LegacyMode } = {};
    for (const group of commandGroups) {
        for (const command of group.commands) {
            handlers[command] = group.handler;
        }
    }
    return handlers;
}

export function handleRecentParameters(user: User, args: string[], interaction: ChatInputCommandInteraction, default_mode: Gamemode) {

    let recentPlayArguments: RecentPlayArguments = new RecentPlayArguments;

    if (interaction)
        recentPlayArguments = handleInteractionOptions(interaction, default_mode);

    else
        recentPlayArguments = handleLegacyArguments(user, args, default_mode);

    return recentPlayArguments;
}
//  Slash commands
function handleInteractionOptions(interaction: ChatInputCommandInteraction, default_mode: Gamemode) {

    const recentPlayArguments: RecentPlayArguments = new RecentPlayArguments;

    const options = interaction.options;

    recentPlayArguments.username = options.getString("username", false) === null ? undefined : options.getString("username", false)!;
    recentPlayArguments.userid = options.getString("userid", false) === null ? undefined : options.getString("userid", false)!;
    recentPlayArguments.discordid = options.getMember("discord") === null ? interaction.user.id : options.getMember("discord")!.toString();
    recentPlayArguments.mode = (options.getString("mode", false) === null ? default_mode : options.getString("mode", false)!) as Gamemode;
    recentPlayArguments.server = (options.getString("server", false) === null ? Server.BANCHO : options.getString("server", false)!) as Server;
    recentPlayArguments.mods = options.getString("mods") === null ? [] : parseModString(options.getString("mods"));
    recentPlayArguments.search = options.getString("query") === null ? "" : options.getString("query")!.toLowerCase()!;
    recentPlayArguments.offset = options.getNumber("index") === null ? 0 : options.getNumber("index")! - 1;
    recentPlayArguments.rank = options.getString("rank") === null ? undefined : options.getString("rank")!.toLowerCase()!;
    recentPlayArguments.include_fails = options.getBoolean("fails") === null ? false : options.getBoolean("fails")!;

    if (recentPlayArguments.discordid) {
        recentPlayArguments.discordid = recentPlayArguments.discordid.replace("<@", "").replace(">", "");
    }

    return recentPlayArguments;

}

//  Text commands
export function handleLegacyArguments(user: User, args: string[], default_mode: Gamemode): RecentPlayArguments {
    const recentPlayArguments: RecentPlayArguments = new RecentPlayArguments;
    recentPlayArguments.mode = default_mode;
    recentPlayArguments.discordid = user.id;

    const handlers = buildHandlers();
    let mode: LegacyMode = LegacyMode.None;

    const usernameargs: string[] = [];

    args
        .map(arg => arg.toLowerCase())
        .forEach(arg => {
            if (handlers[arg]) {
                mode = handlers[arg]();
            } else {
                handleArgsByMode(recentPlayArguments, mode, arg, usernameargs);
            }
        });

    const username = buildUsernameOfArgs(usernameargs);
    handleUsername(recentPlayArguments, username);

    return recentPlayArguments;
}

function handleArgsByMode(recentPlayArguments: RecentPlayArguments, mode: LegacyMode, arg: string, usernameargs: string[]): void {
    switch (mode) {
        case LegacyMode.None:
            handleModeNone(recentPlayArguments, arg, usernameargs);
            break;
        case LegacyMode.Fail:
            recentPlayArguments.include_fails = arg === "true" ? true : arg === "false" ? false : recentPlayArguments.include_fails;
            break;
        case LegacyMode.Gamemode:
            recentPlayArguments.mode = arg as Gamemode;
            break;
        case LegacyMode.Search:
            recentPlayArguments.search += arg;
            break;
        case LegacyMode.Mods:
            recentPlayArguments.mods.push(arg);
            break;
        case LegacyMode.Rank:
            recentPlayArguments.rank += arg;
            break;
    }
}

function handleModeNone(recentPlayArguments: RecentPlayArguments, arg: string, usernameargs: string[]): void {
    if (!isNaN(+arg) && +arg <= 50) {
        recentPlayArguments.offset = +arg;
    } else if (arg.startsWith("<@")) {
        recentPlayArguments.discordid = arg.replace("<@", "").replace(">", "");
    } else {
        usernameargs.push(arg);
    }
}

function handleUsername(recentPlayArguments: RecentPlayArguments, username: string): void {

    if (username === undefined || username === "") {
        return;
    }

    if (isNaN(+username)) {
        recentPlayArguments.username = username;
    } else {
        recentPlayArguments.userid = username;
    }
}
