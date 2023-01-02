import { Title } from "../../../interfaces/title";
import { doughnut_colors } from "../../chart.js/card/doughnut";
import { skill_type } from "../../skills/skills";
import { arraytoBinary, arraytoBinaryFix } from "./parsemods";


const aim_title: any = {
    0: { mod: "nm", title: "Sergeant General" },
    16: { mod: "hr", title: "Precision Biased" },
    8: { mod: "hd", title: "Disappearing Senses" },
    64: { mod: "dt", title: "Cultivatist at Work" },
    24: { mod: "hdhr", title: "Out of Sight" },
    72: { mod: "hddt", title: "Proud Estate Owner" },
    88: { mod: "hddthr", title: "Essence of Aim" },
    2: { mod: "ez", title: "Reading Maestro" },
    10: { mod: "ezhd", title: "Sublime Masochism" },
    66: { mod: "ezdt", title: "Extended Reach" },
    74: { mod: "ezhddt", title: "Vanishing Point" },
    266: { mod: "ezhthd", title: "Scrambling of Time" },
}

const speed_title: any = {
    0: { mod: "nm", title: "Lengthy Incident" },
    16: { mod: "hr", title: "Hi-Speed Mechatron" },
    8: { mod: "hd", title: "Flow of Time" },
    64: { mod: "dt", title: "Breaking the Limit" },
    24: { mod: "hdhr", title: "Finding Solace" },
    72: { mod: "hddt", title: "Traversing Dimensions" },
    88: { mod: "hddthr", title: "Speed Trap Maniac" },
    2: { mod: "ez", title: "Circumvention of Momentum" },
    10: { mod: "ezhd", title: "Consolidation Reimagined" },
    66: { mod: "ezdt", title: "Abused Fortitude" },
    74: { mod: "ezhddt", title: "Fading Sunshine" },
    266: { mod: "ezhthd", title: "Excuse me?" },
}

const acc_title: any = {
    0: { mod: "nomod", title: "Everlasting Cycle" },
    16: { mod: "hr", title: "Metronomical Prodigy" },
    8: { mod: "hd", title: "Pathing of Unseen Roads" },
    64: { mod: "dt", title: "Fortitude of Patience" },
    24: { mod: "hdhr", title: "The Circle Unveiled" },
    72: { mod: "hddt", title: "Finite Tenacity" },
    88: { mod: "hddthr", title: "Vivid Horizons" },
    2: { mod: "ez", title: "Ousted Diminision" },
    10: { mod: "ezhd", title: "Formal Instigation" },
    66: { mod: "ezdt", title: "Sovereign Monocle" },
    74: { mod: "ezhddt", title: "Red Herring" },
    266: { mod: "ezhthd", title: "Epitomy of Cheese" },
}

const strain_title: any = {
    0: { mod: "nomod", title: "Steady As You Go" },
    2: { mod: "ez", title: "Effortless Bliss" },
    8: { mod: "hd", title: "Intense Path" },
    10: { mod: "ezhd", title: "Balanced Progression" },
    16: { mod: "hr", title: "Strenuous Synchrony" },
    24: { mod: "hdhr", title: "Power Through" },
    64: { mod: "dt", title: "Unwavering Focus" },
    66: { mod: "ezdt", title: "Grace Under Pressure" },
    72: { mod: "hddt", title: "Unbreakable Will" },
    74: { mod: "ezhddt", title: "Disguised Ease" },
    88: { mod: "hddthr", title: "Vibrant Vision" },
    266: { mod: "ezhthd", title: "Serene Strength" },
}


export function getTitle(skills: skill_type[]): Title {

    let top_skill: skill_type | undefined = skills.reduce((a, b) => a.average > b.average ? a : b);

    if (top_skill === undefined || top_skill === null || top_skill.label === "Star") {
        top_skill = skills.find(skill => skill.label === "Acc")
    }

    const most_used_mod_int: any = getMostFrequent(top_skill!.scores.slice(0, 20));

    let title = "Quna Fallback title";
    let color = doughnut_colors["Acc"];

    switch (top_skill?.label) {
        case "Aim":
            title = `${aim_title[most_used_mod_int].title}`;
            color = doughnut_colors["Aim"];
            break;
        case "Speed":
            title = `${speed_title[most_used_mod_int].title}`;
            color = doughnut_colors["Speed"];
            break;
        case "Acc":
            title = `${acc_title[most_used_mod_int].title}`;
            color = doughnut_colors["Acc"];
            break;
        case "Strain":
            title = `${strain_title[most_used_mod_int].title}`;
            color = doughnut_colors["Strain"];
            break;
        default:
            title = `${acc_title[most_used_mod_int].title}`;
            color = doughnut_colors["Acc"];
            break;
    }

    return { title: title, colors: color };

}

function getMostFrequent(arr: Array<any>) {
    const hashmap = arr.reduce((acc: any, val: any) => {
        const string_val = arraytoBinaryFix(val.score.mods);
        acc[string_val] = (acc[string_val] || 0) + 1
        return acc
    }, {})
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b)
}