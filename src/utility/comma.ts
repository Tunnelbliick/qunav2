export function replaceDots(input: any): String {
    if(input == undefined)
    return input
    return input.toLocaleString().replaceAll(".", ",");
}

export function replaceFirstDots(input: any): String {
    if(input == undefined)
    return input
    return input.toLocaleString().replace(".", ",");
}