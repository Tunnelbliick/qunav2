import { replaceDots } from "../../../../utility/comma";
import { TopEmbedParameters } from "../top";


export function ctbFields(param: TopEmbedParameters, embed: any) {

    const rank = param.rank;
    const appliedmods = param.appliedmods;
    const max_combo = param.max_combo;
    const acc100 = param.acc100;
    const play = param.play;
    const cs = param.stats.cs;
    const hp = param.stats.hp;
    const difficulty = param.difficulty;
    const min = param.stats.min;
    const strSec = param.stats.strSec;
    const dmin = param.stats.dmin;
    const strDsec = param.stats.strDsec;
    const bpm = param.stats.bpm;
    const total_objects = param.total_objects;


    embed.addFields([
        {
            name: `Grade`,
            value: `**${rank}** ${appliedmods == "+" ? "" : appliedmods}`,
            inline: true
        },
        {
            name: `Score`,
            value: `${replaceDots(play.score)}`,
            inline: true
        },
        {
            name: 'Acc',
            value: `${replaceDots((play.accuracy * 100).toFixed(2))}%`,
            inline: true
        },
        {
            name: 'PP',
            value: `**${play.pp.toFixed(2)}**/${acc100.toFixed(2)}PP`,
            inline: true
        },
        {
            name: 'Combo',
            value: `**${play.max_combo}x**/${max_combo}x`,
            inline: true
        },
        {
            name: 'Hits',
            value: `{${play.statistics.count_300}/${play.statistics.count_100}/${play.statistics.count_50}/${play.statistics.count_miss}}`,
            inline: true
        },
        {
            name: `Map Info`,
            value: `Length: \`${min}:${strSec}\` (\`${dmin}:${strDsec}\`) BPM: \`${bpm}\` Objects: \`${total_objects}\`\n` +
                `CS:\`${cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${hp.toFixed(2).replace(/[.,]00$/, "")}\` Stars: \`${difficulty.star.toFixed(2)}★\``,
            inline: true
        },
    ])

    return embed;
}