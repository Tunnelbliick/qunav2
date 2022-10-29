import { Client, Message, MessageEmbed } from "discord.js";
import { leaderboard } from "../../api/pickem/leaderboard";
import { pickem } from "../../api/pickem/pickem";
import { predict } from "../../api/pickem/predict";
import { predictions } from "../../api/pickem/predictions";
import { registerpickem } from "../../api/pickem/register";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import { interaction_silent_thinking, interaction_thinking } from "../../embeds/utility/thinking";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";

export default (client: Client) => {

    const slector = ["register", "predict", "predictions", "leaderboard", "pickem", "sub", "unsub"]

    client.on('interactionCreate', async (interaction: any) => {

        if (interaction.customId == undefined) {
            return;
        }

        const split = interaction.customId.split("_");

        if (slector.includes(split[0]) == false) {
            return;
        }

        await interaction_silent_thinking(interaction);

        switch (split[0]) {
            case "register":
                registerpickem(interaction);
                break;
            case "predict":
                predict(interaction, client);
                break;
            case "predictions":
                predictions(undefined, interaction, undefined);
                break;
            case "leaderboard":
                leaderboard(undefined, interaction);
                break;
            case "pickem":
                pickem(undefined, interaction, undefined);
                break;
            case "sub":
                sub(interaction);
                break;
            case "unsub":
                unsub(interaction);
                break;
        }

    });

}

async function sub(interaction: any) {

    const userid = interaction.user.id;

    const user: any = await User.findOne({ discordid: await encrypt(userid) });

    checkIfUserExists(user, undefined, interaction);

    if (user !== null) {
        user.notification = true;

        await user.save();
    }

    const embed = new MessageEmbed()
        .setTitle("Subscribed to Notifications")
        .setDescription("You have subscribed to these notifications")
        .setColor("#4b67ba");

    await interaction.editReply({ embeds: [embed] });
    return;
}

async function unsub(interaction: any) {

    const userid = interaction.user.id;

    const user: any = await User.findOne({ discordid: await encrypt(userid) });

    checkIfUserExists(user, undefined, interaction);

    if (user !== null) {
        user.notification = false;

        await user.save();
    }

    const embed = new MessageEmbed()
        .setTitle("Unsubscribed from Notifications")
        .setDescription("You have unsubscribed from these notifications")
        .setColor("#4b67ba");

    await interaction.editReply({ embeds: [embed] });
    return;

}