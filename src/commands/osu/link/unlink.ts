
import { ICommand } from "wokcommands";
import { helpunlink } from "../../../embeds/osu/unlink/help";
import { successfullUnlink } from "../../../embeds/osu/unlink/unlink";
import User from "../../../models/User";
import { encrypt } from "../../../utility/encrypt";
const timeout = new Set()

export default {

    category: "osu!",
    description: "unlinks your osu! profile.",
    slash: "both",


    callback: async ({ message, args, interaction, prefix }) => {
        
        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helpunlink(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        let isSlash = true;

        if (message != null && message.content.startsWith(prefix)) {
            isSlash = false;
        }

        if (isSlash) {
            await User.deleteOne({ discordid: await encrypt(interaction.user.id) });
        } else {
            await User.deleteOne({ discordid: await encrypt(message.author.id) });
        }

        const embed = await successfullUnlink();

        if (isSlash) {
            await interaction.deferReply({ ephemeral: true });
            interaction.editReply({ embeds: [embed] });
        } else {
            message.reply({ embeds: [embed] });
        }

    }

} as ICommand