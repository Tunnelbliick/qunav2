import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../embeds/utility/thinking";
import Pool from "../../../models/Pool";

export default {

    category: "osu!",
    slash: "both",
    description: "Get Owc results for a specific year",
    options: [
        {
            name: 'year',
            description: 'Year to look at',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'mode',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "osu", value: "osu", }, { name: "taiko", value: "taiko", }, { name: "catch", value: "catch", }, { name: "mania", value: "mania" }]
        },
        {
            name: 'keys',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "4K", value: "4", }, { name: "7K", value: "7", }]
        },
        {
            name: 'round',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "Grand Finals", value: "grand_finals", }, { name: "Finals", value: "finals", }, { name: "Semifinals", value: "semifinals", }, { name: "Quarterfinals", value: "quarterfinals" }, { name: "Round of 16", value: "ro16" }, { name: "Round of 32", value: "ro32" }, { name: "Qualifiers", value: "qualifiers" }]
        },

    ],
    callback: async ({ message, interaction, args, prefix, client }) => {

        const default_mode = "osu"

        await interaction_thinking(interaction);
        message_thinking(message);

        const pool = await Pool.findOne({}).sort({ _id: -1 }).exec();

        let description = "";

        let round = "Grand Finals";

        if (!pool) {
            return;
        }

        switch (pool.round) {
            case "grand_finals":
                round = "Grand Finals";
                break;
            case "finals":
                round = "Finals";
                break;
            case "semifinals":
                round = "Semifinals";
                break;
            case "quarterfinals":
                round = "Quarterfinals";
                break;
            case "ro16":
                round = "Round of 16";
                break;
            case "ro32":
                round = "Round of 32";
                break;
            case "qualifiers":
                round = "Qualifiers";
                break;
        }

        for (const key in pool.pool) {

            let prefix = "NM";

            const value = pool.pool.get(key);

            switch (key) {
                case "NoMod":
                    prefix = "NM"
                    break;
                case "Hidden":
                    prefix = "HD"
                    break;
                case "HardRock":
                    prefix = "HR"
                    break;
                case "DoubleTime":
                    prefix = "DT"
                    break;
                case "FreeMod":
                    prefix = "FM"
                    break;
                case "Tiebreaker":
                    prefix = "TB"
                    break;
            }

            let index = 1;
            if (value) {
                value.forEach((v: any) => {
                    description += `**${prefix}${prefix !== "TB" ? index : ""}** ${v}\n`;
                    index++;
                })
            }

            description += "\n";
        }

        const embed = new MessageEmbed()
            .setTitle(`${pool.mode} World Cup ${pool.year} ${round}`)
            .setColor(0x737df9)
            .setDescription(description);

        if (interaction != null) {
            await interaction.editReply({ embeds: [embed] });
        } else {
            await message.reply({ embeds: [embed] });
        }


    }

} as ICommand