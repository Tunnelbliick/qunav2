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
    callback: async ({ message, interaction, args, prefix, client }) => {

        await interaction_thinking(interaction);

        if(interaction.user.id !== "203932549746130944") {
            let embed = new MessageEmbed()
            .setTitle("Nice try!")
            .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({embeds: [embed]});
        }

        let owc_year: any = await owc.findOne({ url: current_tournament });

        let unlocked_round: any[] = [];

        switch(owc_year.current_round) {
            case 3:
                unlocked_round = [-3];
                break;
            case 4:
                unlocked_round = [-5];
                break;
            case 5:
                unlocked_round = [-7];
                break;
        }

        owc_year.unlocked_round = unlocked_round;

        await owc_year.save();

        let embed = new MessageEmbed()
        .setTitle("Unlocked current looser round")
        .setDescription(`Unlocked the current looser round for ${owc_year.name}`)

        await interaction.editReply({embeds: [embed]});

    }

} as ICommand