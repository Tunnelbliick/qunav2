import { EmbedBuilder } from "discord.js";

export function userNotLinked(discord: string | undefined) {
    const embed = new EmbedBuilder()
        .setDescription(`No user is linked for <@${discord == undefined ? "" : discord}`)
        .setColor(0x737df9)

    return embed;
}

export function useridNotFound(userid: string | undefined) {
    const embed = new EmbedBuilder()
        .setDescription(`No user was found with the id ${userid == undefined ? "" : userid}`)
        .setColor(0x737df9)

    return embed;
}

export function usernameNotFound(username: string | undefined) {
    const embed = new EmbedBuilder()
        .setDescription(`No user was found with the username ${username == undefined ? "" : username}`)
        .setColor(0x737df9)

    return embed;
}

export function noBanchoAPI() {
    const embed = new EmbedBuilder()
        .setDescription(`Osu API did not respond`)
        .setColor(0x737df9)

    return embed;
}

export function noDatabase() {
    const embed = new EmbedBuilder()
        .setDescription(`The Database did not respond`)
        .setColor(0x737df9)

    return embed;
}

export function cricitcalError() {
    const embed = new EmbedBuilder()
        .setDescription(`Something went horribly wrong...`)
        .setColor(0x737df9)

    return embed;
}