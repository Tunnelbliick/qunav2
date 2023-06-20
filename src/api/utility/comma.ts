export function replaceFirstDots(input: number | string): string {
    if (input == undefined)
        return input
    return input.toLocaleString().replace(".", ",");
}

export function replaceDots(input: number | string): string {

    // IDK what this is for
    /*
    if(input instanceof Long) {
        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }*/

    if (input === undefined)
        return input

    if (input === null) {
        return "-"
    }

    return input.toLocaleString().replace(".", ",");
}

export function parseNumber(input: number | undefined) {
    if (input === undefined) {
        return "";
    }

    return input.toFixed(2).replace(/[.,]00$/, "")
}

export function round(input: number | undefined) {
    if (input === undefined) {
        return "0";
    }

    return input.toFixed(2);
}