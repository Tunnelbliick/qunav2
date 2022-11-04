import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../../embeds/utility/thinking";
import Pool from "../../../../models/Pool";
import { current_tournament } from "../../../../api/pickem/pickem";
import owc from "../../../../models/owc";
import { noPickEm } from "../../../../embeds/osu/pickem/nopickem";

export default {

    category: "osu!",
    slash: true,
    description: "Get Owc results for a specific year",
    hidden: true,
    options: [{
        name: 'match',
        description: 'match to lock',
        required: false,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
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

        let locked_matches: any[] = owc_year.locked_matches;

        if(locked_matches === undefined) {
            locked_matches = [];
        }

        locked_matches.push(interaction.options.getNumber("match")!)
        owc_year.locked_matches = locked_matches;

        await owc_year.save();

        const embed = new MessageEmbed()
            .setTitle("Locked matches")
            .setDescription(`The matches ${owc_year.locked_matches} are now locked`)

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand