import { Client, Message } from "discord.js";
import { predict } from "../../api/pickem/predict";
import { registerpickem } from "../../api/pickem/register";
import { interaction_silent_thinking, interaction_thinking } from "../../embeds/utility/thinking";

export default (client: Client) => {

    const slector = ["register","predict"]

    client.on('interactionCreate', async (interaction: any) => {

        if (interaction.customId == undefined) {
            return;
        }
        
        let split = interaction.customId.split("_");

        if(slector.includes(split[0]) == false) {
            return;
        }

        await interaction_silent_thinking(interaction);

        switch(split[0]) {
            case "register":
                registerpickem(interaction);
                break;
            case "predict":
                predict(interaction);
                break;
        }

    });

}