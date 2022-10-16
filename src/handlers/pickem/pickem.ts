import { Client, Message } from "discord.js";
import { leaderboard } from "../../api/pickem/leaderboard";
import { predict } from "../../api/pickem/predict";
import { predictions } from "../../api/pickem/predictions";
import { registerpickem } from "../../api/pickem/register";
import { interaction_silent_thinking, interaction_thinking } from "../../embeds/utility/thinking";

export default (client: Client) => {

    const slector = ["register", "predict", "predictions", "leaderboard"]

    client.on('interactionCreate', async (interaction: any) => {

        if (interaction.customId == undefined) {
            return;
        }

        let split = interaction.customId.split("_");

        if (slector.includes(split[0]) == false) {
            return;
        }

        await interaction_silent_thinking(interaction);

        switch (split[0]) {
            case "register":
                registerpickem(interaction);
                break;
            case "predict":
                predict(interaction);
                break;
            case "predictions":
                predictions(undefined, interaction, undefined);
                break;
            case "leaderboard":
                leaderboard(undefined, interaction);
                break;
        }

    });

}