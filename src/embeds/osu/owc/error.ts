import { MessageEmbed } from "discord.js";
import { owc_filter } from "../../../api/owc/filter";

export async function buildOwcNotPortedError(message: any, interaction: any, filter: owc_filter) {

    const embed = new MessageEmbed()
        .setTitle("Tournament not found")
        .setColor("#4b67ba")
        .setDescription(`There was no **${filter.mode}** World Cup found for the year **${filter.year}**\n
    **It might not have been ported yet**.\n
    You can head to the [Quna Discord](https://discord.gg/azPWUfSMm3) and annoy Tunnelblick about it, until he caves in and ports it for you.`)
        .setFooter({ text: "Pleaese dont actually. If there isnt a Challonge you can make one and dm me the link then i can add it automatically" })

    if (interaction != null) {
        await interaction.editReply({ embeds: [embed] });
    } else {
        await message.reply({ embeds: [embed] })
    }

}