import { ChatInputCommandInteraction, Message } from "discord.js";
import { cricitcalError, noBanchoAPI, userNotLinked, useridNotFound, usernameNotFound } from "../../embeds/errors/error";
import { Arguments } from "../../interfaces/arguments";
import { sentryError } from "./sentry";

export function handleExceptions(er: Error, profileArguments: Arguments, interaction: ChatInputCommandInteraction, message: Message) {

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