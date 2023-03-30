import { ICommand } from "wokcommands";
import DiscordJS, { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { current_tournament } from "../../../../api/pickem/pickem";
import owc from "../../../../models/owc";
import pickemRegistration from "../../../../models/pickemRegistration";
import User from "../../../../models/User";
import { decrypt } from "../../../../utility/encrypt";
import pickemPrediction from "../../../../models/pickemPrediction";
import owcgame from "../../../../models/owcgame";
import { interaction_thinking } from "../../../../embeds/utility/thinking";
import { selectRoundByIndex } from "../../../../api/pickem/utility";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const imageToBase64 = require('image-to-base64');
const DataImageAttachment = require("dataimageattachment");

export default {

    category: "osu!",
    slash: true,
    description: "Get Owc results for a specific year",
    hidden: true,
    options: [{
        name: 'text',
        description: 'text',
        required: false,
        type: ApplicationCommandOptionTypes.STRING,
        autocomplete: true,
    }],

    callback: async ({ interaction, client }) => {

        await interaction_thinking(interaction);

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
        }

        const file = await imageToBase64(`assets/pickem/pickem_osu_2022.png`);
        const uri = "data:image/png;base64," + file

        const current: any = await owc.findOne({ url: current_tournament });

        const text = interaction.options.getString("text");

        const description = text + "\n\n**Use the buttons below!**\n- to complete your predictions.\n- to turn messages like these **off/on**";

        const emebd = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle("Reminder for the Quna Pick'em Challenge")
            .setDescription(description)
            .setFooter({ text: "Point gain increases every 2 rounds so you still have a chance!" })
            .setImage("attachment://pickem.png");

        const unsub = new MessageButton()
            .setCustomId("unsub")
            .setLabel("Disable reminder")
            .setStyle("DANGER")

        const sub = new MessageButton()
            .setCustomId("sub")
            .setLabel("Enable reminder")
            .setStyle("SECONDARY")

        const pickem = new MessageButton()
            .setCustomId("pickem")
            .setLabel("Pick'em")
            .setStyle("SUCCESS")

        const row = new MessageActionRow()
            .setComponents([pickem, sub, unsub]);

        let rounds: string[] = ["1"];
        rounds = selectRoundByIndex(current.current_round);

        const matches: any = await owcgame.find({ owc: current.id, round: { $in: rounds } });
        const unlocked: any = matches.sort((a: any, b: any) => b.round - a.round);
        const matchids: any[] = unlocked.map((match: any) => match.id);
        const registrations: any[] = await pickemRegistration.find({ owc: current.id });
        const predictions: any = await pickemPrediction.find({ match: { $in: matchids } });
        const predictionMap: Map<string, number> = new Map<string, number>();
        const registered_users: any[] = [];

        // Put existing user predictions in a map to later validate if the user has already done
        // All predictions
        predictions.forEach((prediction: any) => {
            let prediction_amount = predictionMap.get(prediction.registration.toString());
            if (prediction_amount === undefined) {
                prediction_amount = 1;
            } else {
                prediction_amount += 1;
            }
            predictionMap.set(prediction.registration.toString(), prediction_amount);
        });

        // Only add the user to the list if the user hasnt already done his predictions
        registrations.forEach((registration: any) => {
            const prediction_amount = predictionMap.get(registration.id.toString());

            if (prediction_amount === undefined || prediction_amount < matchids.length) {
                registered_users.push(registration.user);
            }
        });

        // Load users from database if they have notifications on or unset
        const users: any = await User.find({ _id: { $in: registered_users }, $or: [{ notification: true }, { notification: { $exists: 0 } }] })

        // Dm users
        for (const user of users) {
            const discordid = await decrypt(user.discordid);
            const discord_user: any = await client.users.fetch(discordid).catch(() => null);

            await discord_user.send({ embeds: [emebd], components: [row], files: [new DataImageAttachment(uri, "pickem.png")] }).catch(() => {
                console.log(`${user.username} cannot be dmd`);
            });
        }

        await interaction.editReply("Done.");

        return;
    },

    error: async ({ message }) => {
        console.log("I dont know what happened");
        return;
    }


} as ICommand