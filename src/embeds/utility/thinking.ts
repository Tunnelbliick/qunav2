export async function interaction_thinking(interaction: any) {
    if(interaction)
    await interaction.deferReply();
}

export async function interaction_silent_thinking(interaction: any) {
    if(interaction)
    await interaction.deferReply({ ephemeral: true });
}

export function message_thinking(message: any) {
    if(message)
    message.channel.sendTyping();
}