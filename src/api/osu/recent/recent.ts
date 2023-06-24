import { TextChannel, ChatInputCommandInteraction, Message, User, InteractionResponse } from "discord.js";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { Server } from "../../../interfaces/enum/server";
import { thinking } from "../../../utility/thinking";
import { login } from "../../utility/banchoLogin";
import { v2 } from "osu-api-extended";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";
import qunaUser from "../../../mongodb/qunaUser";
import { encrypt } from "../../../utility/jwt";
import { finishTransaction, sentryError, startTransaction } from "../../utility/sentry";
import { decomposeMods, parseModString } from "../../../utility/parsemods";
import { buildUsernameOfArgs } from "../../utility/buildusernames";
import { Arguments, BanchoParams } from "../../../interfaces/arguments";
import { handleExceptions } from "../../utility/exceptionHandler";
import { OsuScore } from "../../../interfaces/osu/score/osuScore";
import { calcRetries, filterRecent } from "../../utility/recentUtility";
import { downloadBeatmap } from "../../utility/downloadbeatmap";
import { simulateRecentPlay, simulateRecentPlayFC } from "../../pp/rosupp/simulate";
import { getBeatmapFromCache } from "../beatmap/beatmap";
import { getBeatmapDifficulty } from "../../pp/rosupp/difficulty";
import { getAkatsukiUserById, getBanchoUserById } from "../profile/profile";
import { loadacc100WithoutBeatMapDownload } from "../../pp/db/loadSS";
import { difficulty } from "../../../interfaces/pp/difficulty";
import { OsuBeatmap } from "../../../interfaces/osu/beatmap/osuBeatmap";
import { TopPosition, getTopPositionForUser } from "../top/top";
import { LeaderboardPosition, getLeaderBoardPositionByScore } from "../leaderboard/leaderboard";
import { generateRecentEmbed, generateRecentEmbedCompact } from "../../../embeds/recent";
import { AkatsukiScore } from "../../../interfaces/osu/score/akatsukiScore";
import axios from "axios";
import beatmap from "../../../mongodb/beatmap";
import { Beatmap } from "../../../interfaces/osu/beatmap/beatmap";
import { calculateAcc } from "../../utility/stats";

export class RecentPlayArguments extends Arguments {
    search: string = "";
    offset: number = 0;
    mods: string[] = [];
    rank: string | undefined;
    include_fails: boolean = true;
    mode: Gamemode | undefined;
    server: Server | undefined;
}

enum LegacyMode {
    None,
    Gamemode,
    Fail,
    Search,
    Mods,
    Rank,
}

class Performance {
    difficulty: difficulty | undefined;
    accSS: number | undefined;
    simulated: number | undefined;
    simulatedFc: number | undefined;
}

type PerformanceReturnTypes = difficulty | number;

class CommonData {
    user: OsuUser | undefined;
    beatmap: OsuBeatmap | undefined;
    leaderboard: LeaderboardPosition | undefined;
    best: TopPosition | undefined;
}

type CommonDataReturnTypes = OsuUser | OsuBeatmap | TopPosition | LeaderboardPosition | undefined;

export class RecentScore {
    retry_count: number | undefined;
    leaderboard: LeaderboardPosition | undefined;
    best: TopPosition | undefined;
    score: OsuScore | undefined;
    user: OsuUser | undefined;
    beatmap: OsuBeatmap | undefined;
    server: Server | undefined;
    performance: Performance | undefined;
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
    let recentScore = new RecentScore();

    try {

        thinking(channel, interaction);

        if ((recentPlayArguments.userid == undefined && recentPlayArguments.username === undefined) && recentPlayArguments.discordid) {

            await qunaUser.findOne({ discordid: await encrypt(recentPlayArguments.discordid) }).then(userObject => {
                if (userObject === null) {
                    throw new Error("NOTLINKED");
                } else {
                    switch (recentPlayArguments.server) {
                        case Server.AKATSUKI:
                            recentPlayArguments.userid = userObject.akatsuki;
                            break;
                        default:
                            recentPlayArguments.userid = userObject.userid;
                            break;
                    }
                }
            })
        }

        if (recentPlayArguments.userid) {

            switch (recentPlayArguments.server) {
                case Server.AKATSUKI:
                    recentScore = await getRecentPlaysForUserAkatsuki(+recentPlayArguments.userid, recentPlayArguments, recentPlayArguments.mode);
                    break;
                default:
                    recentScore = await getRecentPlaysForUserBancho(+recentPlayArguments.userid, recentPlayArguments, recentPlayArguments.mode);
                    break;
            }

        }

        const embed = generateRecentEmbed(recentScore, undefined);

        if (interaction) {
            interaction.editReply({ embeds: [embed] }).then((msg) => {

                setTimeout(() => updateMessage(msg, recentScore), 1000);
            });
        } else {
            channel.send({ embeds: [embed] }).then((msg) => {

                setTimeout(() => updateMessage(msg, recentScore), 1000);
            });
        }


    } catch (er: unknown) {
        handleExceptions(er as Error, recentPlayArguments, interaction, message);
    } finally {
        finishTransaction(transaction);
    }
}

async function updateMessage(msg: Message | InteractionResponse, data: RecentScore) {
    const compact = await generateRecentEmbedCompact(data, false);
    return msg.edit({ embeds: [compact] });
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

function buildHandlers(): { [command: string]: () => LegacyMode } {
    const handlers: { [command: string]: () => LegacyMode } = {};
    for (const group of commandGroups) {
        for (const command of group.commands) {
            handlers[command] = group.handler;
        }
    }
    return handlers;
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

export async function getRecentPlaysForUserBancho(userid: number, args: RecentPlayArguments, mode?: Gamemode) {

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

    const recentplay = recentplays[filterFoundIndex];
    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${recentplay.beatmap.id}_${recentplay.beatmap.checksum}.osu`, recentplay.beatmap.id);
    const retries = calcRetries(recentplays, recentplay.beatmap.id, recentplay.mods);

    const common = await getCommonData(recentplay);
    const performance = await getPerformance(recentplay);

    const recentScore: RecentScore = new RecentScore();

    recentScore.retry_count = retries;
    recentScore.score = recentplay;
    recentScore.beatmap = common.beatmap;
    recentScore.user = common.user;
    recentScore.leaderboard = common.leaderboard;
    recentScore.best = common.best;
    recentScore.performance = performance;

    return recentScore;
}

export async function getRecentPlaysForUserAkatsuki(userid: number, args: RecentPlayArguments, mode?: Gamemode) {

    // Get recent plays
    const max = 50;
    const offset = args.offset;
    const limit = max - offset;

    const recentplays = await getRecentAkatsuki(userid, 0, limit);
    if (recentplays.length == 0) {
        throw new Error("NORECENTPLAYS");
    }

    // Apply filter
    const filterFoundIndex = filterRecent(recentplays, args);
    if (filterFoundIndex == -1) {
        throw new Error("NOPLAYFOUND");
    }

    const recentplay = recentplays[filterFoundIndex];

    await downloadBeatmap('https://osu.ppy.sh/osu/', `${process.env.FOLDER_TEMP}${recentplay.beatmap.id}_${recentplay.beatmap.checksum}.osu`, recentplay.beatmap.id);
    const retries = calcRetries(recentplays, recentplay.beatmap.id, recentplay.mods);

    const common = await getCommonDataAkatsuki(recentplay);
    const performance = await getPerformance(recentplay);

    const recentScore: RecentScore = new RecentScore();

    recentScore.retry_count = retries;
    recentScore.score = recentplay;
    recentScore.beatmap = common.beatmap;
    recentScore.user = common.user;
    recentScore.leaderboard = common.leaderboard;
    recentScore.best = common.best;
    recentScore.performance = performance;
    recentScore.server = args.server;

    return recentScore;
}

async function getCommonData(score: OsuScore) {

    const common: CommonData = new CommonData();

    const isunranked = score.pp === null ? true : false;

    const beatmap = getBeatmapFromCache(score.beatmap.id, score.beatmap.checksum);
    const user = getBanchoUserById(score.user_id);
    const leaderboard = getLeaderBoardPositionByScore(score.beatmap.id, score.mode as Gamemode, score);
    const best = getTopPositionForUser(score, score.mode as Gamemode, isunranked);

    await Promise.allSettled([beatmap, user, leaderboard, best]).then((result: PromiseSettledResult<CommonDataReturnTypes>[]) => {
        result.forEach((outcome, index) => {
            if (outcome.status === 'rejected') {
                const err = new Error(`Promise ${index} was rejected with reason: ${outcome.reason}`)
                sentryError(err);
            } else {
                switch (index) {
                    case 0:
                        common.beatmap = outcome.value as OsuBeatmap;
                        break;
                    case 1:
                        common.user = outcome.value as OsuUser;
                        break;
                    case 2:
                        common.leaderboard = outcome.value as LeaderboardPosition;
                        break;
                    case 3:
                        common.best = outcome.value as TopPosition;
                }
            }
        });
    })

    return common;

}

async function getCommonDataAkatsuki(score: OsuScore) {

    const common: CommonData = new CommonData();

    const isunranked = score.pp === null ? true : false;

    const user = getAkatsukiUserById(score.user_id);
    const leaderboard = getLeaderBoardPositionByScore(score.beatmap.id, score.mode as Gamemode, score);
    const best = getTopPositionForUser(score, score.mode as Gamemode, isunranked);

    await Promise.allSettled([undefined, user, leaderboard, best]).then((result: PromiseSettledResult<CommonDataReturnTypes>[]) => {
        result.forEach((outcome, index) => {
            if (outcome.status === 'rejected') {
                const err = new Error(`Promise ${index} was rejected with reason: ${outcome.reason}`)
                sentryError(err);
            } else {
                switch (index) {
                    case 0:
                        common.beatmap = score.beatmap as OsuBeatmap;
                        break;
                    case 1:
                        common.user = outcome.value as OsuUser;
                        break;
                    case 2:
                        common.leaderboard = outcome.value as LeaderboardPosition;
                        break;
                    case 3:
                        common.best = outcome.value as TopPosition;
                }
            }
        });
    })

    return common;

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

    await Promise.allSettled([diff, accSS, simulated, simulatedFc]).then((result: PromiseSettledResult<PerformanceReturnTypes>[]) => {
        result.forEach((outcome, index) => {
            if (outcome.status === 'rejected') {
                const err = new Error(`Promise ${index} was rejected with reason: ${outcome.reason}`)
                sentryError(err);
            } else {
                switch (index) {
                    case 0:
                        performance.difficulty = outcome.value as difficulty;
                        break;
                    case 1:
                        performance.accSS = outcome.value as number;
                        break;
                    case 2:
                        performance.simulated = outcome.value as number;
                        break;
                    case 3:
                        performance.simulatedFc = outcome.value as number;
                        break;
                }
            }
        });
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

export async function getRecentAkatsuki(
    userid: string | number,
    relax: 0 | 1 | 2,
    limit: number
) {
    try {
        await login();

        const data: AkatsukiScore[] = await (await axios.get(`${process.env.AKATSUKI_API}/get_user_recent?rx=${relax}&u=${userid}`)).data

        if (data.hasOwnProperty("error")) {
            throw new Error("NOTFOUNDID");
        }

        const beatmapids: string[] = data.map(d => d.beatmap_id);

        const beatmaps: Beatmap[] = await beatmap.find({ mapid: { $in: beatmapids } });
        const beatmap_map: Map<string, OsuBeatmap> = new Map<string, OsuBeatmap>();

        beatmaps.forEach(b => {
            beatmap_map.set(b.id.toString(), b.beatmap as OsuBeatmap);
        })

        const mapped = await Promise.all(data.map(async d => {
            const foundBeatmap = beatmap_map.get(d.beatmap_id);

            if (foundBeatmap === undefined) {
                d.beatmap = await getBeatmapFromCache(+d.beatmap_id)
            } else {
                d.beatmap = foundBeatmap;
            }

            return convertToOsu(d);
        }));

        return mapped as OsuScore[];
    } catch (error) {

        console.log(error);

        throw new Error("NOSERVER");
    }
}

function convertToOsu(score: AkatsukiScore) {

    const osuScore: OsuScore = {
        accuracy: 0,
        beatmap: score.beatmap,
        beatmapset: score.beatmap.beatmapset,
        created_at: score.date,
        id: 0,
        max_combo: +score.maxcombo,
        max_pp: undefined,
        mode: "osu",
        mode_int: 0,
        mods: decomposeMods(+score.enabled_mods),
        passed: true,
        pp: +score.pp,
        replay: false,
        score: +score.score,
        perfect: undefined,
        statistics: {
            count_300: +score.count300,
            count_100: +score.count100,
            count_50: +score.count50,
            count_geki: +score.countgeki,
            count_katu: +score.countkatu,
            count_miss: +score.countmiss
        },
        user_id: +score.user_id,
        rank: score.rank
    }

    const total_objects = osuScore.beatmap.count_circles + osuScore.beatmap.count_sliders + osuScore.beatmap.count_spinners;
    osuScore.accuracy = calculateAcc(osuScore, total_objects) / 100;

    return osuScore;

}

