import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../../api/owc/owc";
import { interaction_thinking } from "../../../../embeds/utility/thinking";
import { current_tournament } from "../../../../api/pickem/pickem";
import owc from "../../../../models/owc";
import { noPickEm } from "../../../../embeds/osu/pickem/nopickem";
import owcgame from "../../../../models/owcgame";
import pickemPrediction from "../../../../models/pickemPrediction";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default {

    category: "osu!",
    slash: true,
    description: "Get Owc results for a specific year",
    hidden: true,
    options: [{
        name: 'match',
        description: 'match to invert',
        required: false,
        type: ApplicationCommandOptionTypes.NUMBER,
        autocomplete: true,
    }],

    callback: async ({ message, interaction, args, prefix, client }) => {

        await interaction_thinking(interaction);

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
        }

        const owc_year: any = await owc.findOne({ url: current_tournament });

        if (owc_year === null) {
            await noPickEm(undefined, interaction);
            return;
        }

        const match: any = await owcgame.findOne({ matchid: interaction.options.getNumber("match") });

        const predictions: any = await pickemPrediction.find({ match: match.id });
        const prediction_save_list: any[] = [];

        predictions.forEach((prediction: any) => {
            const team1_score = prediction.team1_score;
            const team2_score = prediction.team2_score;

            if(team2_score > team1_score) {
                prediction.winner_index = 1;
            } else {
                prediction.winner_index = 2;
            }

            prediction.team1_score = team2_score;
            prediction.team2_score = team1_score;

            prediction.score = `${team2_score}-${team1_score}`;

            prediction_save_list.push(prediction);

        });

        await pickemPrediction.bulkSave(prediction_save_list);

        const embed = new MessageEmbed()
            .setTitle("Swapped predictions")
            .setDescription(`The predictions for ${owc_year.locked_matches} were swapped`)

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand