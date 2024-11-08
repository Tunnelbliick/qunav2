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

const modsFullRestricted = [
    ['None', 'NM'],
    ['Easy', 'EZ'],
    ['HardRock', 'HR'],
    ['Hidden', 'HD'],
    ['DoubleTime', 'DT'],
    ['HalfTime', 'HT'],
    ['Flashlight', 'FL'],
    ['Key4', '4K'],
    ['Key5', '5K'],
    ['Key6', '6K'],
    ['Key7', '7K'],
    ['Key8', '8K'],
    ['Key9', '9K'],
    ['Key1', '1K'],
    ['Key3', '3K'],
    ['Key2', '2K'],
    ['Mirror', 'MR'],
]

const mods_restricted = ['NM', 'EZ', 'HR', 'HD', 'DT', 'HT', 'FL']


export function parseModString(input: string | null) {

    let modString = "";
    if (input != null)
        modString = input.replace("+", "").toLowerCase();
    const parsedMods: any[] = [];

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

export function parseModRestricted(input: string[] | null) {

    const return_mods: string[] = [];

    if (input == null) {
        return [];
    }

    mods_restricted.forEach((mod) => {
        input.forEach((i) => {
            if (i == 'NC') {
                i = 'DT'
            }
            if (mod == i) {
                return_mods.push(mod);
            }
        });
    });

    return return_mods;
}

export function arraytoBinary(mods?: Array<any>) {
    let val = 0;

    if (mods !== undefined) {
        for (const mod of mods) {
            for (const [key, values] of Object.entries(binaries)) {
                for (const arg of values) {
                    if (arg.trim().toLowerCase() === mod.acronym.trim().toLowerCase()) {

                        // Handle specific cases
                        if (mod.acronym.trim().toLowerCase() === "td") {
                            continue;
                        }

                        if (mod.acronym.trim().toLowerCase() === "nc") {
                            val += 64;
                        } else if (mod.acronym.trim().toLowerCase() === "pf") {
                            val += 16384;
                        }

                        // Additional logic can be added for handling settings if necessary
                        val += parseInt(key);
                    }
                }
            }
        }
    }

    return val;
}
export function arraytoBinaryFix(mods: Array<any>) {
    let val = 0;

    if (mods !== undefined) {
        for (const mod of mods) {
            for (const [key, values] of Object.entries(binaries)) {
                for (const arg of values) {
                    if (arg.trim().toLowerCase() === mod.acronym.trim().toLowerCase()) {

                        // Switch cases for specific mods
                        switch (mod.acronym.trim().toLowerCase()) {
                            case "nm":
                                val += 0;
                                break;
                            case "ez":
                                val += 2;
                                break;
                            case "hd":
                                val += 8;
                                break;
                            case "hr":
                                val += 16;
                                break;
                            case "dt":
                            case "nc":
                                val += 64;
                                break;
                            case "ht":
                                val += 256;
                                break;
                        }
                    }
                }
            }
        }
    }

    return val;
}

