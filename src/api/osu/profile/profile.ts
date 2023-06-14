import { TextChannel, ChatInputCommandInteraction, Message, User, InteractionResponse, AttachmentBuilder } from "discord.js";
import { Gamemode } from "../../../interfaces/enum/gamemodes";
import { Server } from "../../../interfaces/enum/server";
import { thinking } from "../../../utility/thinking";
import { login } from "../../utility/banchoLogin";
import { v2 } from "osu-api-extended";
import { OsuUser } from "../../../interfaces/osu/user/osuUser";
import qunaUser from "../../../mongodb/qunaUser";
import { encrypt } from "../../../utility/jwt";
import { finishTransaction, sentryError, startTransaction } from "../../utility/sentry";
import { buildCompressedProfile, buildProfileEmbed } from "../../../embeds/profile";
import { generateProfileChart } from "../../../graphs/profile/profile";
import { cricitcalError, noBanchoAPI, userNotLinked, useridNotFound, usernameNotFound } from "../../../embeds/errors/error";

class ProfileArguments {
    userid: string | undefined;
    username: string | undefined;
    discordid: string | undefined;
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

        if (profileArguments.discordid) {

            await qunaUser.findOne({ discordid: await encrypt(profileArguments.discordid) }).then(userObject => {
                if (userObject === null) {
                    throw new Error("NOTLINKED");
                } else {
                    profileArguments.userid = userObject.userid;
                }
            }).catch((err: Error) => {
                console.error(err);
                throw err;
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

        if (userData === undefined) {
            throw new Error("NOTFOUND");
        }

        const embed = await buildProfileEmbed(userData, profileArguments.mode!)
        const chart = await generateProfileChart(userData);

        const file = new AttachmentBuilder(chart, { name: `${userData.id}_graph.png` });

        if (interaction) {
            interaction.reply({ embeds: [embed], files: [file] }).then((msg) => {

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

function handleExceptions(er: Error, profileArguments: ProfileArguments, interaction: ChatInputCommandInteraction, message: Message) {

    let embed = cricitcalError();

    console.log(er.message);

    switch (er.message) {
        case "NOTLINKED":

            embed = userNotLinked(profileArguments.discordid);
            if (interaction) {
                interaction.reply({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }
            break;

        case "NOTFOUNDID":

            embed = useridNotFound(profileArguments.userid);
            if (interaction) {
                interaction.reply({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }
            break;

        case "NOTFOUNDUSERNAME":

            embed = usernameNotFound(profileArguments.username);
            if (interaction) {
                interaction.reply({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }
            break;

        case "NOSERVER":

            embed = noBanchoAPI();
            if (interaction) {
                interaction.reply({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }

            sentryError(er);
            break;

        default:

            embed = cricitcalError();
            if (interaction) {
                interaction.reply({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }

            sentryError(er);
            console.error(er);
            break;
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
                return reject(new Error("NOTFOUNDID"));
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
                return reject(new Error("NOTFOUNDUSERNAME"));
            }
            return resolve(data as OsuUser);
        });

        user.catch(() => {
            return reject(new Error("NOSERVEAR"));
        });
    });
}