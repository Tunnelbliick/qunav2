import { Client } from "discord.js"
import owc from "../models/owc";
import owcteam from "../models/owcteam";


export default (client: Client) => {

    client.on('interactionCreate', async interaction => {
        if (!interaction.isAutocomplete()) return;
        if (!["owc", "mwc", "twc", "cwc"].includes(interaction.commandName)) return;
        const option_name = interaction.options.getFocused(true).name;
        if (option_name !== "year") return;

        let default_mode = "osu";

        switch (interaction.commandName) {
            case "owc":
                default_mode = "osu";
                break;
            case "mwc":
                default_mode = "mania";
                break;
            case "twc":
                default_mode = "taiko";
                break;
            case "cwc":
                default_mode = "catch";
                break;
        }

        let tournaments: any = await owc.find({ mode: default_mode });

        if (default_mode === "mania") {
            const default_keys = interaction.options.getString("keys") === null ? "4K" : interaction.options.getString("keys");
            tournaments = await owc.find({ mode: default_mode, keys: default_keys });
        }

        let years: any = [];
        tournaments.forEach((t: any) => {
            years.push(t.year);
        })

        years = [...new Set(years)];
        years = years.sort((a: any, b: any) => a - b);

        const focusedValue = interaction.options.getFocused();

        const filtered = years.filter((choice: any) => choice.toLocaleLowerCase().startsWith(focusedValue.toLocaleLowerCase())).slice(0, 24);
        await interaction.respond(
            filtered.map((choice: any) => ({ name: choice, value: choice })),
        );
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isAutocomplete()) return;
        if (!["owc", "mwc", "twc", "cwc"].includes(interaction.commandName)) return;
        const option_name = interaction.options.getFocused(true).name;
        if (option_name !== "country") return;

        let default_mode = "osu";

        switch (interaction.commandName) {
            case "owc":
                default_mode = "osu";
                break;
            case "mwc":
                default_mode = "mania";
                break;
            case "twc":
                default_mode = "taiko";
                break;
            case "cwc":
                default_mode = "catch";
                break;
        }

        let participants;
        let tournament: any;

        const year = interaction.options.getString("year");

        if (year !== null) {
            tournament = await owc.findOne({ mode: default_mode, year: year });
        }

        if (tournament !== undefined) {
            participants = await owcteam.find({ owc: tournament.id, mode: default_mode });
        } else {
            participants = await owcteam.find({ mode: default_mode });
        }

        const focusedValue = interaction.options.getFocused();

        const filtered = participants.filter((choice: any) => choice.name.toLocaleLowerCase().startsWith(focusedValue.toLocaleLowerCase())).slice(0, 24);
        await interaction.respond(
            filtered.map((choice: any) => ({ name: choice.name, value: choice.name })),
        );
    });

}
