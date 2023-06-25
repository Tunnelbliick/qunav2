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
import { buildCompressedProfile, buildProfileEmbed } from "../../../embeds/profile";
import { generateProfileChart } from "../../../graphs/profile/profile";
import { Arguments } from "../../../interfaces/arguments";
import { handleExceptions } from "../../utility/exceptionHandler";
import axios from "axios";
import { AkatsukiUser, AkatsukiUserInfo, AkatsukiUserRank } from "../../../interfaces/osu/user/akatsukiUser";

class ProfileArguments extends Arguments {
    check_skills: boolean | undefined;
    mode: Gamemode | undefined;
    server: Server | undefined;
}

export async function profile(channel: TextChannel, user: User, message: Message, interaction: ChatInputCommandInteraction, args: string[], mode: Gamemode) {

    const profileArguments: ProfileArguments = handleProfileParameters(user, args, interaction, mode);
    const transaction = startTransaction("Load Profile", "Load the User Profile", user.username, "profile");

    try {

        thinking(channel, interaction);

        let userData: OsuUser | undefined;

        if ((profileArguments.userid == undefined && profileArguments.username === undefined) && profileArguments.discordid) {

            await qunaUser.findOne({ discordid: await encrypt(profileArguments.discordid) }).then(userObject => {
                if (userObject === null) {
                    throw new Error("NOTLINKED");
                } else {
                    console.log(profileArguments);
                    switch (profileArguments.server) {
                        case Server.AKATSUKI:
                            profileArguments.userid = userObject.akatsuki;
                            break;
                        default:
                            profileArguments.userid = userObject.userid;
                            break;
                    }
                }
            })

        }

        console.log(profileArguments);

        if (profileArguments.userid || profileArguments.username) {

            if (profileArguments.userid) {
                switch (profileArguments.server) {
                    case Server.AKATSUKI:
                        await getAkatsukiUserById(+profileArguments.userid, profileArguments.mode).then((data: OsuUser) => {
                            console.log(data);
                            userData = data;
                        })
                        break;
                    default:
                        await getBanchoUserById(+profileArguments.userid, profileArguments.mode).then((data: OsuUser) => {
                            userData = data;
                        })
                        break;
                }
            } else {
                await getBanchoUserByUsername(profileArguments.username!, profileArguments.mode).then((data: OsuUser) => {
                    userData = data;
                })
            }

        }

        if (userData === undefined) {
            throw new Error("NOTFOUND");
        }

        const embed = await buildProfileEmbed(userData, profileArguments.mode!)
        const chart = await generateProfileChart(userData);

        const file = new AttachmentBuilder(chart, { name: `${userData.id}_graph.png` });

        if (interaction) {
            interaction.editReply({ embeds: [embed], files: [file] }).then((msg) => {

                setTimeout(() => updateMessage(msg, file, userData!, profileArguments), 60000);
            });
        } else {
            channel.send({ embeds: [embed], files: [file] }).then((msg) => {

                setTimeout(() => updateMessage(msg, file, userData!, profileArguments), 60000);
            });
        }

    } catch (er: unknown) {
        handleExceptions(er as Error, profileArguments, interaction, message);
    } finally {
        finishTransaction(transaction);
    }

}

async function updateMessage(msg: Message | InteractionResponse, file: AttachmentBuilder, data: OsuUser, args: ProfileArguments) {
    const compact = await buildCompressedProfile(data, args.mode!);
    return msg.edit({ embeds: [compact], files: [file] });
}

function handleProfileParameters(user: User, args: string[], interaction: ChatInputCommandInteraction, default_mode: Gamemode): typeof profileArguments {

    let profileArguments: ProfileArguments = new ProfileArguments;

    if (interaction)
        profileArguments = handleInteractionOptions(interaction, default_mode);
    else
        profileArguments = handleLegacyArguments(user, args, default_mode);

    return profileArguments;
}

function handleInteractionOptions(interaction: ChatInputCommandInteraction, default_mode: Gamemode) {

    const profileArguments: ProfileArguments = new ProfileArguments;

    const options = interaction.options;

    profileArguments.username = options.getString("username", false) === null ? "" : options.getString("username", false)!;
    profileArguments.userid = options.getString("userid", false) === null ? "" : options.getString("userid", false)!;
    profileArguments.discordid = options.getMember("discord") === null ? interaction.user.id : options.getMember("discord")!.toString();
    profileArguments.check_skills = options.getBoolean("skills") === null ? false : options.getBoolean("skills", false)!;
    profileArguments.mode = (options.getString("mode", false) === null ? default_mode : options.getString("mode", false)!) as Gamemode;
    profileArguments.server = (options.getString("server", false) === null ? Server.BANCHO : options.getString("server", false)!) as Server;

    if (profileArguments.discordid) {
        profileArguments.discordid = profileArguments.discordid.replace("<@", "").replace(">", "");
    }

    return profileArguments;

}

function handleLegacyArguments(user: User, args: string[], default_mode: Gamemode) {

    const profileArguments: ProfileArguments = new ProfileArguments;

    profileArguments.server = Server.BANCHO;
    profileArguments.mode = default_mode;

    if (args.length === 0) {
        profileArguments.discordid = user.id;
        return profileArguments;
    }

    for (const arg of args) {

        switch (arg) {
            case "-ts":
                profileArguments.check_skills = true;
                break;
            case "-akatsuki":
                profileArguments.server = Server.AKATSUKI;
                break;
            case "-gatari":
                profileArguments.server = Server.GATARI;
                break;
            case "-bancho":
                profileArguments.server = Server.BANCHO;
                break;
            default:
                if (arg.startsWith("<@")) {
                    profileArguments.discordid = arg.replace("<@", "").replace(">", "");
                } else if (isNaN(+arg)) {
                    profileArguments.username = arg;
                } else {
                    profileArguments.userid = arg;
                }
        }

    }

    if (profileArguments.userid === undefined && profileArguments.username === undefined) {
        profileArguments.discordid = user.id;
    }

    return profileArguments;

}

export async function getBanchoUserById(userid: number, mode?: Gamemode): Promise<OsuUser> {
    await login();

    if (mode == undefined) {
        mode = "osu" as Gamemode;
    }

    return new Promise((resolve, reject) => {
        const user = v2.user.details(userid, mode, "id")

        user.then((data: object) => {
            if (data.hasOwnProperty("error")) {
                return reject(new Error("NOTFOUNDID"));
            }
            return resolve(data as OsuUser);
        });

        user.catch(() => {
            return reject(new Error("NOSERVER"));
        });
    });
}

export async function getBanchoUserByUsername(username: string, mode?: Gamemode): Promise<OsuUser> {
    await login();

    if (mode == undefined) {
        mode = "osu" as Gamemode;
    }

    return new Promise((resolve, reject) => {
        const user = v2.user.details(username, mode, "username")

        user.then((data: object) => {
            if (data.hasOwnProperty("error")) {
                return reject(new Error("NOTFOUNDUSERNAME"));
            }
            return resolve(data as OsuUser);
        });

        user.catch(() => {
            return reject(new Error("NOSERVER"));
        });
    });
}

export async function getAkatsukiUserById(userid: number, mode?: Gamemode): Promise<OsuUser> {
    let mode_int = 0;

    switch (mode) {
        case Gamemode.OSU:
            mode_int = 0;
            break;
        case Gamemode.TAIKO:
            mode_int = 1;
            break;
        case Gamemode.FRUITS:
            mode_int = 2;
            break;
        case Gamemode.MANIA:
            mode_int = 3;
            break;
    }

    try {

        const user: AkatsukiUser = (await axios.get(`${process.env.AKATSUKI_API}get_user?u=${userid}&m=${mode_int}`)).data[0];
        const info: AkatsukiUserInfo = (await axios.get(`${process.env.AKATSUKI_API}users?id=${userid}&mode=${mode_int}`)).data;
        const rank: AkatsukiUserRank = (await axios.get(`${process.env.AKATSUKI_API}profile-history/rank?user_id=${userid}&mode=${mode_int}`)).data.data;

        console.log(info);
        console.log(rank);

        return akatsukiToOsu(user, info, rank);

    } catch (err) {

        console.log(err);

        throw new Error("NOSERVER");
    }
}

function akatsukiToOsu(user: AkatsukiUser, info: AkatsukiUserInfo, rank: AkatsukiUserRank) {

    console.log(user);

    const osuUser: OsuUser = {
        avatar_url: `https://a.akatsuki.gg/${user.user_id}`,
        country_code: info.country,
        default_group: "",
        id: +user.user_id,
        is_active: false,
        is_bot: false,
        is_deleted: false,
        is_online: false,
        is_supporter: false,
        last_visit: info.latest_activity,
        pm_friends_only: false,
        profile_colour: "",
        username: user.username,
        cover_url: "",
        discord: "",
        has_supported: false,
        interests: "",
        join_date: info.registered_on,
        kudosu: {
            total: 0,
            available: 0
        },
        location: "",
        max_blocks: 0,
        max_friends: 0,
        occupation: "",
        playmode: akatsukiModeToOsuMode(user.mode),
        playstyle: [],
        post_count: 0,
        profile_order: [],
        title: "",
        title_url: "",
        twitter: "",
        website: "",
        country: {
            code: info.country,
            name: info.country
        },
        cover: {
            custom_url: "",
            url: "",
            id: ""
        },
        account_history: [],
        active_tournament_banner: "",
        badges: [],
        beatmap_playcounts_count: +user.playcount,
        comments_count: 0,
        favourite_beatmapset_count: 0,
        follower_count: 0,
        graveyard_beatmapset_count: 0,
        groups: [],
        guest_beatmapset_count: 0,
        loved_beatmapset_count: 0,
        mapping_follower_count: 0,
        monthly_playcounts: [],
        page: {
            html: "",
            raw: ""
        },
        pending_beatmapset_count: 0,
        previous_usernames: [],
        ranked_beatmapset_count: 0,
        replays_watched_counts: [],
        scores_best_count: 0,
        scores_first_count: 0,
        scores_pinned_count: 0,
        scores_recent_count: 0,
        statistics: {
            level: {
                current: +user.level.split(".")[0],
                progress: +user.level.split(".")[1]
            },
            global_rank: +user.pp_rank,
            pp: +user.pp_raw,
            ranked_score: +user.ranked_score,
            hit_accuracy: +user.accuracy,
            play_count: +user.playcount,
            play_time: 0,
            total_score: +user.total_score,
            total_hits: 0,
            maximum_combo: 0,
            replays_watched_by_others: 0,
            is_ranked: false,
            grade_counts: {
                ss: +user.count_rank_ss,
                ssh: +user.count_rank_ssh,
                s: +user.count_rank_s,
                sh: +user.count_rank_sh,
                a: +user.count_rank_a
            },
            country_rank: +user.pp_country_rank,
            rank: {
                country: +user.pp_country_rank
            },
            variants: []
        },
        support_level: 0,
        user_achievements: [],
        rankHistory: {
            mode: akatsukiModeToOsuMode(user.mode),
            data: akatsukiHistoryToOsuHistory(rank)
        },
        rank_history: {
            mode: akatsukiModeToOsuMode(user.mode),
            data: akatsukiHistoryToOsuHistory(rank)
        },
        ranked_and_approved_beatmapset_count: 0,
        unranked_beatmapset_count: 0
    }

    return osuUser;
}

function akatsukiModeToOsuMode(mode_int: number): string {
    switch (mode_int) {
        case 0:
            return "osu";
        case 1:
            return "taiko";
        case 2:
            return "fruits";
        case 3:
            return "mania";
        default:
            return "osu";
    }
}

function akatsukiHistoryToOsuHistory(rank: AkatsukiUserRank) {

    const data: number[] = [];

    rank.captures.forEach(caputre => {
        data.push(caputre.overall);
    })

    return data;
}