import tinygradient from "tinygradient";

export function getDifficultyColor(difficulty: number): any {
    const stops = [
        { offset: 1.5, red: 79, green: 192, blue: 255 },
        { offset: 2, red: 79, green: 255, blue: 213 },
        { offset: 2.5, red: 124, green: 255, blue: 79 },
        { offset: 3.375, red: 246, green: 240, blue: 92 },
        { offset: 4.625, red: 255, green: 128, blue: 104 },
        { offset: 5.875, red: 255, green: 60, blue: 113 },
        { offset: 7, red: 101, green: 99, blue: 222 },
        { offset: 8, red: 24, green: 21, blue: 142 }
    ]

    let colour: any = {}
    let i = -1;

    if (difficulty || difficulty > 8) {
        colour = { red: 0, green: 0, blue: 0 }
    } else {
        i = stops.findIndex((stop: any) => difficulty <= stop.offset)
    }

    if (i == -1)
        colour = { red: 0, green: 0, blue: 0 }
    else if (i - 1 < 0)
        colour = {
            red: stops[i].red,
            green: stops[i].green,
            blue: stops[i].blue
        }
    else
        colour = {
            red: interpolate(difficulty, stops[i - 1].offset, stops[i].offset,
                stops[i - 1].red, stops[i].red),
            green: interpolate(difficulty, stops[i - 1].offset, stops[i].offset,
                stops[i - 1].green, stops[i].green),
            blue: interpolate(difficulty, stops[i - 1].offset, stops[i].offset,
                stops[i - 1].blue, stops[i].blue),
        }

    return [colour.red, colour.green, colour.blue];
}


function interpolate(value: any, sourceStart: any, sourceEnd: any, destStart: any, destEnd: any) {
    return destStart + (destEnd - destStart) * ((value - sourceStart) / (sourceEnd - sourceStart))
}