import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../../embeds/utility/thinking";
import Pool from "../../../../models/Pool";
import { current_tournament } from "../../../../api/pickem/pickem";
import owc from "../../../../models/owc";
import { noPickEm } from "../../../../embeds/osu/pickem/nopickem";
import owcgame from "../../../../models/owcgame";
import pickemPrediction from "../../../../models/pickemPrediction";
import pickemstatistic from "../../../../models/pickemstatistic";
import { ObjectId } from "bson";

export default {

    category: "osu!",
    slash: true,
    description: "Get Owc results for a specific year",
    hidden: true,

    callback: async ({ message, interaction, args, prefix, client }) => {

        await interaction_thinking(interaction);

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
        }

        const owc_year: any = await owc.findOne({ url: current_tournament });
        const owcgames: any[] = await owcgame.find({ owc: owc_year.id });
        let owcgames_ids: string[] = [];

        owcgames.forEach((game: any) => {
            owcgames_ids.push(game.id);
        })

        let prediction_map: Map<string, any[]> = new Map<string, any[]>();
        const all_predictions = await pickemPrediction.find({ match: { $in: owcgames_ids } });

        all_predictions.forEach((prediction: any) => {

            if (prediction_map.has(prediction.match.toString())) {
                let predictions: any[] = prediction_map.get(prediction.match)!;
                predictions?.push(prediction);
                prediction_map.set(prediction.match.toString(), predictions);
            } else {
                let predictions: any[] = []
                predictions?.push(prediction);
                prediction_map.set(prediction.match.toString(), predictions);
            }

        })

        for (let [key, value] of prediction_map) {

            let team1_count = 0;
            let team2_count = 0;

            value.forEach((value) => {
                if (value.team1_score > value.team2_score) {
                    team1_count++;
                } else {
                    team2_count++;
                }
            })

            let statistic = await pickemstatistic.findOne({ match: key })

            if (statistic === null) {
                statistic = new pickemstatistic();
                statistic.match = value[0].match;
            }

            statistic.team1 = team1_count;
            statistic.team2 = team2_count;

            statistic.save();

        }



        const embed = new MessageEmbed()
            .setTitle("Locked round")
            .setDescription(`The rounds ${owc_year.locked_round} are now locked`)

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand