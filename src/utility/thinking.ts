import { TextChannel, ChatInputCommandInteraction } from "discord.js";

export function thinking(channel: TextChannel, interaction: ChatInputCommandInteraction) {
    if(interaction) {
        interaction.deferReply();
    } else {
        channel.sendTyping();
    }
}