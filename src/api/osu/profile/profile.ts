import { TextChannel, ChatInputCommandInteraction, Message, User } from "discord.js";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { Server } from "../../../interfaces/enum/server";
import { thinking } from "../../../utility/thinking";
import { login } from "../../utility/banchoLogin";
import { v2 } from "osu-api-extended";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";
import qunaUser from "../../../mongodb/qunaUser";
import { encrypt } from "../../../utility/jwt";

class ProfileArguments {
    userid: string | undefined;
    username: string | undefined;
    discordid: string | undefined;
    check_skills: boolean | undefined;
    mode: Gamemode | undefined;
    server: Server | undefined;
}

export async function profile(channel: TextChannel, user: User, message: Message, interaction: ChatInputCommandInteraction, args: string[], mode: Gamemode) {

    try {

        thinking(channel, interaction);

        let userData: OsuUser | undefined = undefined;

        const profileArguments: ProfileArguments = handleProfileParameters(user, args, interaction, mode);

        if (profileArguments.discordid) {

            await qunaUser.findOne({ discordid: await encrypt(profileArguments.discordid) }).then(userObject => {
                if (userObject === null) {
                    throw new Error("NOTLINKED");
                } else {
                    profileArguments.userid = userObject.userid;
                }
            }).catch((error: Error) => {
                console.error(error);
                throw new Error("DATABASEERR");
            });

        }


        if (profileArguments.userid || profileArguments.username) {

            if (profileArguments.userid) {
                await getBanchoUserById(profileArguments.userid, profileArguments.mode).then((data: OsuUser) => {
                    userData = data;
                }).catch((error: Error) => {
                    console.error(error);
                    throw error;
                });
            } else {
                await getBanchoUserByUsername(profileArguments.username!, profileArguments.mode).then((data: OsuUser) => {
                    userData = data;
                }).catch((error: Error) => {
                    console.error(error);
                    throw error;
                });
            }

        }

    } catch (er: any) {
        // TODO implement error embeds for feedback
        // TODO implement Sentry for logging
        switch (er.message) {
            case "NOTLINKED":
                console.log("user is not linked to quna");
                break;
            case "NOTFOUND":
                console.log("no user found");
                break;
            case "NOSERVER":
                console.log("The API was not found");
                break;
            case "DATABASEERR":
                console.log("The database didnt respond");
                break;
            default:
                console.log("something went wrongh");
        }
    }

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
    return profileArguments;

}

export async function getBanchoUserById(userid: string, mode?: Gamemode): Promise<OsuUser> {
    await login();

    if (mode == undefined) {
        mode = "osu" as Gamemode;
    }

    return new Promise((resolve, reject) => {
        const user = v2.user.details(userid, mode, "id")

        user.then((data: object) => {
            if (data.hasOwnProperty("error")) {
                return reject(new Error("NOTFOUND"));
            }
            return resolve(data as OsuUser);
        });

        user.catch(() => {
            return reject(new Error("NOSERVEAR"));
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
                return reject(new Error("NOTFOUND"));
            }
            return resolve(data as OsuUser);
        });

        user.catch(() => {
            return reject(new Error("NOSERVEAR"));
        });
    });
}