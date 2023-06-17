import { TextChannel, ChatInputCommandInteraction, Message, User, InteractionResponse, AttachmentBuilder } from "discord.js";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { Server } from "../../../interfaces/enum/server";
import { thinking } from "../../../utility/thinking";
import { login } from "../../utility/banchoLogin";
import { v2 } from "osu-api-extended";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";
import qunaUser from "../../../mongodb/qunaUser";
import { encrypt } from "../../../utility/jwt";
import { finishTransaction, startTransaction } from "../../utility/sentry";
import { parseModString } from "../../../utility/parsemods";
import { buildUsernameOfArgs } from "../../utility/buildusernames";
import { Arguments } from "../../../interfaces/arguments";
import { handleExceptions } from "../../utility/exceptionHandler";
import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { calcRetries, filterRecent } from "../../utility/recentUtility";
import { downloadBeatmap } from "../../utility/downloadbeatmap";
import { simulateRecentPlay, simulateRecentPlayFC } from "../../pp/rosupp/simulate";
import { getBeatmapFromCache } from "../beatmap/beatmap";
import { getBeatmapDifficulty } from "../../pp/rosupp/difficulty";
import { getBanchoUserById } from "../profile/profile";
import { loadacc100WithoutBeatMapDownload } from "../../pp/db/loadSS";
import { difficulty } from "../../../interfaces/pp/difficulty";
import { OsuBeatmap } from "../../../interfaces/osu/beatmap/osuBeatmap";

export class RecentPlayArguments extends Arguments {
    search: string = "";
    offset: number = 0;
    mods: string[] = [];
    rank: string | undefined;
    include_fails: boolean = true;
    mode: Gamemode | undefined;
    server: Server | undefined;
}

class BanchoParams {
    include_fails?: boolean;
    mode?: 'osu' | 'fruits' | 'mania' | 'taiko';
    mods?: number;
    limit?: string;
    offset?: string;
}

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

export async function recent(channel: TextChannel, user: User, message: Message, interaction: ChatInputCommandInteraction, args: string[], mode: Gamemode) {

    const recentPlayArguments: RecentPlayArguments = handleRecentParameters(user, args, interaction, mode);
    const transaction = startTransaction("Recentplay", "Shows the recentplay for a user", user.username, "recent");

    if ((recentPlayArguments.userid == undefined && recentPlayArguments.username === undefined) && recentPlayArguments.discordid) {

        await qunaUser.findOne({ discordid: await encrypt(recentPlayArguments.discordid) }).then(userObject => {
            if (userObject === null) {
                throw new Error("NOTLINKED");
            } else {
                recentPlayArguments.userid = userObject.userid;
            }
        })
    }

    console.log(recentPlayArguments);

    if (recentPlayArguments.userid) {

        await getRecentPlaysForUser(+recentPlayArguments.userid, recentPlayArguments, recentPlayArguments.mode);

    }

    try {


    } catch (er: unknown) {
        handleExceptions(er as Error, recentPlayArguments, interaction, message);
    } finally {
        finishTransaction(transaction);
    }
}


function handleRecentParameters(user: User, args: string[], interaction: ChatInputCommandInteraction, default_mode: Gamemode) {

    let recentPlayArguments: RecentPlayArguments = new RecentPlayArguments;

    if (interaction)
        recentPlayArguments = handleInteractionOptions(interaction, default_mode);
    else
        recentPlayArguments = handleLegacyArguments(user, args, default_mode);

    return recentPlayArguments;
}

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
function handleLegacyArguments(user: User, args: string[], default_mode: Gamemode): RecentPlayArguments {

    const recentPlayArguments: RecentPlayArguments = new RecentPlayArguments;
    const usernameargs: string[] = [];

    recentPlayArguments.mode = default_mode;
    recentPlayArguments.discordid = user.id;

    // Build handlers map
    const handlers: { [command: string]: () => LegacyMode } = {};

    let mode: LegacyMode = LegacyMode.None;

    for (const group of commandGroups) {
        for (const command of group.commands) {
            handlers[command] = group.handler;
        }
    }

    for (let i = 0; i < args.length; i++) {

        const arg = args[i].toLowerCase();

        if (handlers[arg]) {
            mode = handlers[arg]();
            continue;
        }

        switch (mode) {
            case LegacyMode.None:
                if (i === 0 && !isNaN(+arg) && +arg <= 50) {
                    recentPlayArguments.offset = +arg;
                } else if (arg.startsWith("<@")) {
                    recentPlayArguments.discordid = args[0].replace("<@", "").replace(">", "");
                } else {
                    usernameargs.push(arg);
                }
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

        const username = buildUsernameOfArgs(usernameargs);

        if (isNaN(+username)) {
            recentPlayArguments.username = username;
        } else {
            recentPlayArguments.userid = username;
        }

    }

    return recentPlayArguments;

}

/*t ype RecentPlayResult = {
    retries: number;
    recentplay: OsuScore;
    user: any;
    beatmap: any;
    acc100: any;
    ppOfPlay?: any;
    ppIffc: any;
    difficulty: any;
    top100?: number;
    leaderboard?: number;
}*/

/*// Helper function to handle results
async function handleResults(
    results: PromiseSettledResult<any>[],
    recentplay: any,
    isRanked: boolean
): Promise<RecentPlayResult> {

    const top100 = results[5].find((t: any) => t.value.id === recentplay.best_id);
    const leaderboard = results[6].value?.find((t: any) => t.value.id === recentplay.best_id);

    return {
        retries: calcRetries(recentplays, recentplay.beatmap.id, recentplay.mods),
        recentplay: recentplay,
        user: results[0].value,
        beatmap: results[1].value,
        acc100: results[2].value,
        ppOfPlay: isRanked ? results[3].value : undefined,
        ppIffc: results[3].value,
        difficulty: results[4].value,
        top100: top100?.position,
        leaderboard: leaderboard?.position
    };
}*/

class Performance {
    difficulty: difficulty | undefined;
    accSS: number | undefined;
    simulated: number | undefined;
    simulatedFc: number | undefined;
}

interface recentScore {
    score: OsuScore,
    user: OsuUser,
    beatmap: OsuBeatmap,
    performance: Performance
}

export async function getRecentPlaysForUser(userid: number, args: RecentPlayArguments, mode?: Gamemode) {

    // Get recent plays
    const max = 50;
    const offset = args.offset;
    const limit = max - offset;


    const recentplays = await getRecentBancho(userid, args.include_fails, limit.toString(), mode, offset.toString());
    if (recentplays.length == 0) {
        throw new Error("NORECENTPLAYS");
    }

    // Apply filter
    const filterFoundIndex = filterRecent(recentplays, args);
    if (filterFoundIndex == -1) {
        throw new Error("NOPLAYFOUND");
    }

    //console.log(recentplays[0]);

    const recentplay = recentplays[filterFoundIndex];
    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${recentplay.beatmap.id}_${recentplay.beatmap.checksum}.osu`, recentplay.beatmap.id);

    const beatmap = await getBeatmapFromCache(recentplay.beatmap.id, recentplay.beatmap.checksum);
    const performance = await getPerformance(recentplay);
    console.log(recentplay);
    console.log(performance);

    /*const commonPromises = [
        loadacc100WithoutBeatMapDownload(recentplay.beatmap.id, recentplay.beatmap.checksum, recentplay.mods, mode),
    ];

    if (recentplay.pp === null) {
        const promises = [
            ...commonPromises,
            simulateRecentPlay(recentplay),
            simulateRecentPlayFC(recentplay, await commonPromises[1])
        ];

        return Promise.allSettled(promises).then(results => handleResults(results, recentplay, true));

    } else {
        const promises = [
            ...commonPromises,
            simulateRecentPlayFC(recentplay, await commonPromises[1]),
            getTopForUser(userid, undefined, undefined, recentplay.mode),
            getLeaderBoard(recentplay.beatmap.id, recentplay.mode)
        ];

        return Promise.allSettled(promises).then(results => handleResults(results, recentplay, false));
    }*/
}

async function getPerformance(score: OsuScore) {

    const performance: Performance = new Performance();

    const diff = getBeatmapDifficulty(score.beatmap.id, score.beatmap.checksum, score.mods);
    const accSS = await loadacc100WithoutBeatMapDownload(score.beatmap.id, score.beatmap.checksum, score.mods, score.mode);
    let simulated = undefined;
    let simulatedFc = undefined;

    if (score.pp === null) {
        simulated = simulateRecentPlay(score);
        simulatedFc = simulateRecentPlayFC(score);
    } else {
        simulated = score.pp;
        simulatedFc = simulateRecentPlayFC(score);
    }

    await Promise.allSettled([diff, accSS, simulated, simulatedFc]).then((result: any) => {
        performance.difficulty = result[0].value;
        performance.accSS = result[1].value;
        performance.simulated = result[2].value;
        performance.simulatedFc = result[3].value;

    })

    return performance;
}

export async function getRecentBancho(
    userid: number,
    include_fails?: boolean,
    limit?: string,
    mode?: Gamemode,
    offset?: string
) {
    try {
        await login();

        const params: BanchoParams = {
            include_fails,
            limit,
            mode,
            offset
        };

        const data: object = await v2.scores.user.category(userid, "recent", params);

        if (data.hasOwnProperty("error")) {
            throw new Error("NOTFOUNDID");
        }

        return data as OsuScore[];
    } catch {
        throw new Error("NOSERVER");
    }
}

