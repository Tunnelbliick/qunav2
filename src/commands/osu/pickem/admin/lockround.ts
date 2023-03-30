import { ICommand } from "wokcommands";
import { MessageEmbed } from 'discord.js';
import { interaction_thinking } from "../../../../embeds/utility/thinking";
import { current_tournament } from "../../../../api/pickem/pickem";
import owc from "../../../../models/owc";
import { noPickEm } from "../../../../embeds/osu/pickem/nopickem";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default {

    category: "osu!",
    aliases: "unlocklooser",
    slash: true,
    description: "Get Owc results for a specific year",
    hidden: true,
    options: [{
        name: 'round',
        description: 'round to lock',
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

        if(owc_year === null) {
            await noPickEm(undefined, interaction);
            return;
        }

        let locked_round: any[] = owc_year.locked_round;

        if(locked_round === undefined) {
            locked_round = [];
        }

        locked_round.push(interaction.options.getNumber("round")!)
        owc_year.locked_round = locked_round;

        await owc_year.save();

        const embed = new MessageEmbed()
            .setTitle("Locked round")
            .setDescription(`The rounds ${owc_year.locked_round} are now locked`)

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand