import { ICommand } from "wokcommands";
import { buildSimilar } from "../../../../api/commands/osu/recommend/recommend/recommend";
import { helprecommend } from "../../../../embeds/osu/recommend/recommend/help";

export default {

    category: "osu!",
    description: `To recommend a beatmap, you have to supply some parameters:\n` +
        `\`!rec [URL | ID] [options]\`\n\n` + `**Options**\n` +
        `**-m mods**\n` +
        `Specify mods for this beatmap recommendation! The default setting is Nomod (NM).\n\n` +
        `**-t type**\n` +
        `Specifies the type of the beatmap. **One (1) type minimum requirement.**\n\n` +
        `Use \`!rec -t\` to get a list of available beatmap types`,

    callback: async ({ message, args, prefix }) => {


        if (args[0] == "-h" || args[0] == "-help" || args[0] == "h" || args[0] == "help") {
             const embed = helprecommend(prefix);
             message.reply({ embeds: [embed] });
             return;
         }

         buildSimilar(message, args, prefix);

    }
} as ICommand