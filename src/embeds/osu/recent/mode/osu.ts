import { BeatmapStats } from "../../../../api/beatmaps/stats";
import { replaceDots } from "../../../../utility/comma";
import { buildScoreString, buildStatisticNoMissString, buildStatisticString } from "../../../../utility/score";
import { buildppIfLessMiss } from "../../beatmap/beatmap";
import { RecentEmbedParameters } from "../recent";

export function stdFields(param: RecentEmbedParameters, embed: any) {

    const rank = param.rank;
    const progress = param.progress;
    const appliedmods = param.appliedmods;
    const ppofplay = param.ppofplay;
    const ppiffc = param.ppiffc;
    const max_combo = param.max_combo;
    const acc100 = param.acc100;
    const fc_acc = param.fc_acc;
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
            value: `**${rank}** ${progress} ${appliedmods == "+" ? "" : appliedmods}`,
            inline: true
        },
        {
            name: `Score`,
            value: `${buildScoreString(play)}`,
            inline: true
        },
        {
            name: 'Acc',
            value: `${replaceDots((play.accuracy * 100).toFixed(2))}%`,
            inline: true
        },
        {
            name: 'PP',
            value: `**${ppofplay.toFixed(2)}**/${acc100.toFixed(2)}PP`,
            inline: true
        },
        {
            name: 'Combo',
            value: `**${play.max_combo}x**/${max_combo}x`,
            inline: true
        },
        {
            name: 'Hits',
            value: `${buildStatisticString(play)}`,
            inline: true
        },
        {
            name: 'Possible PP Values',
            value: `\`\`\`${buildppIfLessMiss(ppofplay, ppiffc, (play.statistics.miss ?? 0))}\`\`\``,
        },
        {
            name: `Map Info`,
            value: `Length: \`${min}:${strSec}\` (\`${dmin}:${strDsec}\`) BPM: \`${bpm}\` Objects: \`${total_objects}\`\n` +
                `CS:\`${cs.toFixed(2).replace(/[.,]00$/, "")}\` AR:\`${difficulty.ar.toFixed(2).replace(/[.,]00$/, "")}\` OD:\`${difficulty.od.toFixed(2).replace(/[.,]00$/, "")}\` HP:\`${hp.toFixed(2).replace(/[.,]00$/, "")}\` Stars: \`${difficulty.stars.toFixed(2)}★\``,
        },
    ]);

    return embed;
}