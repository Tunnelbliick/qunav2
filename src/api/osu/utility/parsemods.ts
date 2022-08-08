const binaries = {
    0: ['None', 'NM'],
    1: ['NoFail', 'NF'],
    2: ['Easy', 'EZ'],
    4: ['TouchDevice', 'TD'],
    8: ['Hidden', 'HD'],
    16: ['HardRock', 'HR'],
    32: ['SuddenDeath', 'SD'],
    64: ['DoubleTime', 'DT'],
    128: ['Relax', 'RX'],
    256: ['HalfTime', 'HT'],
    512: ['Nightcore', 'NC'], // Only set along with DoubleTime. i.e: NC only gives 576
    1024: ['Flashlight', 'FL'],
    2048: ['Autoplay', 'AP'],
    4096: ['SpunOut', 'SO'],
    8192: ['Relax2', 'AP'], // Autopilot
    16384: ['Perfect', 'PF'], // Only set along with SuddenDeath. i.e: PF only gives 16416  
    32768: ['Key4', '4K'],
    65536: ['Key5', '5K'],
    131072: ['Key6', '6K'],
    262144: ['Key7', '7K'],
    524288: ['Key8', '8K'],
    1048576: ['FadeIn', 'FI'],
    2097152: ['Random', 'RD'],
    4194304: ['Cinema', 'CM'],
    8388608: ['Target', 'TP'],
    16777216: ['Key9', '9K'],
    33554432: ['KeyCoop', ''],
    67108864: ['Key1', '1K'],
    134217728: ['Key3', '3K'],
    268435456: ['Key2', '2K'],
    536870912: ['ScoreV2', 'SV2'],
    1073741824: ['Mirror', 'MR'],
}

const mods = [
    ['None', 'NM'],
    ['NoFail', 'NF'],
    ['Easy', 'EZ'],
    ['TouchDevice', 'TD'],
    ['Hidden', 'HD'],
    ['HardRock', 'HR'],
    ['SuddenDeath', 'SD'],
    ['DoubleTime', 'DT'],
    ['Relax', 'RX'],
    ['HalfTime', 'HT'],
    ['Nightcore', 'NC'], // Only set along with DoubleTime. i.e: NC only gives 576
    ['Flashlight', 'FL'],
    ['Autoplay', 'AP'],
    ['SpunOut', 'SO'],
    ['Relax2', 'AP'], // Autopilot
    ['Perfect', 'PF'], // Only set along with SuddenDeath. i.e: PF only gives 16416  
    ['Key4', '4K'],
    ['Key5', '5K'],
    ['Key6', '6K'],
    ['Key7', '7K'],
    ['Key8', '8K'],
    ['FadeIn', 'FI'],
    ['Random', 'RD'],
    ['Cinema', 'CM'],
    ['Target', 'TP'],
    ['Key9', '9K'],
    ['KeyCoop', ''],
    ['Key1', '1K'],
    ['Key3', '3K'],
    ['Key2', '2K'],
    ['ScoreV2', 'SV2'],
    ['Mirror', 'MR'],
]


export function parseModString(input: string) {

    let modString = "";
    if (input != null)
        modString = input.replace("+", "").toLowerCase();
    let parsedMods: any[] = [];

    mods.forEach((mod) => {
        if (modString.includes(mod[0].toLowerCase())) {
            if ('' == mod[1]) {
                modString = modString.replace(mod[0].toLowerCase(), "");
                parsedMods.push(mod[0])
            }
            else {
                modString = modString.replace(mod[0].toLowerCase(), "");
                parsedMods.push(mod[1])
            }
        }
    });

    mods.forEach((mod) => {
        if (modString.includes(mod[1].toLowerCase())) {
            if ('' == mod[1]) { }
            else {
                modString = modString.replace(mod[1].toLowerCase(), "");
                parsedMods.push(mod[1]);
            }
        }
    });

    return parsedMods;
}

export function arraytoBinary(mods?: Array<any>) {
    let val = 0;

    if (mods != undefined)
    for (let mod of mods) {
        for (const [key, values] of Object.entries(binaries))
            for (let arg of values) if (arg.trim().toLowerCase() == mod.trim().toLowerCase()) {
                if(mod.trim().toLowerCase() == "nc") {
                    val += 64;
                } else if(mod.trim().toLowerCase() == "pf") {
                    val += 16384;
                }
                val += parseInt(key);
            }
    }
    return val;
}

