import { all_skills } from "../../skills/skills";
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

enum Type {
    Aim,
    Speed,
    Acc
}

export function getTitle(skills: all_skills) {

    /*acc_title.forEach((title: any) => {
        console.log(`${(arraytoBinary(parseModString(title.mod)))}: { mod:"${title.mod}", title: "${title.title}"},`);
    })*/

    let type: Type;
    let plays = [];
    const aim = skills.aim_avg;
    const speed = skills.speed_avg;
    const acc = skills.acc_avg;

    const max = Math.max(aim, speed, acc);

    switch (max) {
        case aim:
            type = Type.Aim;
            plays = skills.aim.slice(0, 20);
            break;
        case speed:
            type = Type.Speed;
            plays = skills.speed.slice(0, 20);
            break;
        case acc:
            type = Type.Acc;
            plays = skills.acc.slice(0, 20);
            break;
        default:
            type = Type.Aim;
            plays = skills.aim.slice(0, 20);
            break;
    }

    const most_used_mod_int: any = getMostFrequent(plays);

    let title = "Circle Clicker";

    switch (type) {
        case Type.Aim:
            title = `Aim - ${aim_title[most_used_mod_int].mod} - ${aim_title[most_used_mod_int].title}`;
            break;
        case Type.Speed:
            title = `Speed - ${aim_title[most_used_mod_int].mod} - ${speed_title[most_used_mod_int].title}`;
            break;
        case Type.Acc:
            title = `Acc - ${aim_title[most_used_mod_int].mod} - ${acc_title[most_used_mod_int].title}`;
            break;
        default:
            title = `Aim - ${aim_title[most_used_mod_int].mod}- ${aim_title[most_used_mod_int].title}`;
            break;
    }

    return title;

}

function getMostFrequent(arr: Array<any>) {
    const hashmap = arr.reduce((acc: any, val: any) => {
        const string_val = arraytoBinaryFix(val.score.mods);
        acc[string_val] = (acc[string_val] || 0) + 1
        return acc
    }, {})
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b)
}