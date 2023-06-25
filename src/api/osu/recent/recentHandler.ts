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
import { handleRecentParameters } from "./handleRecentParameters";
import { getRecentPlaysForUserAkatsuki } from "./recentAkatsuki";
import { getRecentPlaysForUserBancho } from "./recentBancho";

export class RecentPlayArguments extends Arguments {
    search: string = "";
    offset: number = 0;
    mods: string[] = [];
    rank: string | undefined;
    include_fails: boolean = true;
    mode: Gamemode | undefined;
    server: Server | undefined;
}

export class Performance {
    difficulty: difficulty | undefined;
    accSS: number | undefined;
    simulated: number | undefined;
    simulatedFc: number | undefined;
}

type PerformanceReturnTypes = difficulty | number;

export class CommonData {
    user: OsuUser | undefined;
    beatmap: OsuBeatmap | undefined;
    leaderboard: LeaderboardPosition | undefined;
    best: TopPosition | undefined;
}

export type CommonDataReturnTypes = OsuUser | OsuBeatmap | TopPosition | LeaderboardPosition | undefined;

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

export async function getPerformance(score: OsuScore) {

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