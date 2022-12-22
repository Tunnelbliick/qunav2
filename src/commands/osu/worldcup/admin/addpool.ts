import { ICommand } from "wokcommands";
import DiscordJS, { MessageEmbed } from 'discord.js';
import { getInfo } from "../../../../api/owc/owc";
import { interaction_thinking, message_thinking } from "../../../../embeds/utility/thinking";
import Pool from "../../../../models/Pool";

export default {

    category: "osu!",
    aliases: "test",
    slash: true,
    description: "Get Owc results for a specific year",
    hidden: true,
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
            name: 'round',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "Grand Finals", value: "grand_finals", }, { name: "Finals", value: "finals", }, { name: "Semifinals", value: "semifinals", }, { name: "Quarterfinals", value: "quarterfinals" }, { name: "Round of 16", value: "ro16" }, { name: "Round of 32", value: "ro32" }, { name: "Qualifiers", value: "qualifiers" }]
        },
        {
            name: 'keys',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [{ name: "4K", value: "4", }, { name: "7K", value: "7", }]
        },
        {
            name: 'pool',
            description: 'Gamemode to lookup',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },

    ],
    callback: async ({ message, interaction, args, prefix, client }) => {

        await interaction_thinking(interaction);

        if (interaction.user.id !== "203932549746130944") {
            const embed = new MessageEmbed()
                .setTitle("Nice try!")
                .setDescription("This command is secured for only the bot owner")

            await interaction.editReply({ embeds: [embed] });
        }

        const options = interaction.options;

        const year: string | null = options.getString("year");
        const mode: string | null = options.getString("mode");
        let round: string | null = options.getString("round");
        const keys: string | null = options.getString("key");
        const maps: string[] | undefined = options.getString("pool")?.split("        ");

        const mappool: Map<string, string[]> = new Map<string, string[]>();
        let mod_maps: any[] = [];
        let mod = "NoMod";

        if (!maps) {

            const embed = new MessageEmbed()
                .setTitle("Error!")
                .setDescription("Coudnt create mappool")

            await interaction.editReply({ embeds: [embed] });

            return;
        }

        for (const map of maps) {
            const split = map.trim().replace("*   ", "").split("  ");
            if (split.length === 1) {
                if (mod_maps.length !== 0) {
                    mappool.set(mod, mod_maps);
                    mod_maps = [];
                }
                mod = split[0].replace(" ", "");
            }

            if (split.length > 1) {
                mod_maps.push(split[1]);
            }
        }

        mappool.set(mod, mod_maps);

        if (!round || !year || !mode || !keys || !mappool) {

            const embed = new MessageEmbed()
                .setTitle("Error!")
                .setDescription("Coudnt create mappool")

            await interaction.editReply({ embeds: [embed] });

            return;
        }

        const pool = new Pool();
        pool.round = round;
        pool.year = year;
        pool.mode = mode;
        pool.keys = keys;
        pool.pool = mappool;

        pool.save();

        let description = "";

        round = "Grand Finals";

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

        await interaction.editReply({ embeds: [embed] });

    }

} as ICommand