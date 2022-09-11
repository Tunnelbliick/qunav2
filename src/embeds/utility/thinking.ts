export function interaction_thinking(interaction: any) {
    if(interaction)
    interaction.deferReply();
}

export function message_thinking(message: any) {
    if(message)
    message.channel.startTyping();
}