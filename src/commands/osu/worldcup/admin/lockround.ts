import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../../embeds/utility/thinking";
import Pool from "../../../../models/Pool";
import { current_tournament } from "../../../../api/pickem/pickem";
import owc from "../../../../models/owc";

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
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
        autocomplete: true,
    }],
    
    callback: async ({ message, interaction, args, prefix, client }) => {

        await interaction_thinking(interaction);

        if (interaction.user.id !== "203932549746130944") {
            let embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
        }

        let owc_year: any = await owc.findOne({ url: current_tournament });

        let locked_round: any[] = owc_year.locked_round;

        if(locked_round === undefined) {
            locked_round = [];
        }

        locked_round.push(interaction.options.getNumber("round")!)
        owc_year.locked_round = locked_round;

        console.log(owc_year.locked_round);

        await owc_year.save();

        let embed = new MessageEmbed()
            .setTitle("Locked round")
            .setDescription(`The rounds ${owc_year.locked_round} are now locked`)

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand