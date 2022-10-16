import { MessageEmbed } from "discord.js";
import { noPickEm } from "../../embeds/osu/pickem/nopickem";
import { checkIfUserExists } from "../../embeds/utility/nouserfound";
import owc from "../../models/owc";
import pickemRegistration from "../../models/pickemRegistration";
import User from "../../models/User";
import { encrypt } from "../../utility/encrypt";
import { current_tournament } from "./pickem";

export async function registerpickem(interaction: any) {

    let owc_year: any = await owc.findOne({ url: current_tournament });

    if(owc_year === null) {
        await noPickEm(undefined, interaction);
        return;
    }

    let user: any = await User.findOne({ discordid: await encrypt(interaction.user.id) });

    checkIfUserExists(user, undefined, interaction);

    let registration = await pickemRegistration.findOne({ owc: owc_year.id, user: user.id });

    if (registration === null) {

        registration = new pickemRegistration();
        registration.owc = owc_year.id;
        registration.user = user.id;
        registration.total_score = 0;

        await registration.save();

        let embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle("Registered for pick'em!")
            .setDescription(`You have sucessfully registered for the pick'em`)
            .setFooter({ text: "Use the pick button to start picking!" })

        await interaction.editReply({ embeds: [embed] });
    } else {
        let embed = new MessageEmbed()
            .setColor("#4b67ba")
            .setTitle("Already registered for pick'em!")
            .setDescription(`You are already registered for this years pick'em`)
            .setFooter({ text: "Use the pick button to start picking!" })

        await interaction.editReply({ embeds: [embed] });
    }
}