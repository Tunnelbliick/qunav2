import { Long } from "mongodb";

export function replaceDots(input: any): string {

    if(input instanceof Long) {
        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if(input === undefined)
    return input

    if(input === null) {
    return "-"
    }

    return input.toLocaleString().replaceAll(".", ",");
}

export function replaceFirstDots(input: any): string {
    if(input == undefined)
    return input
    return input.toLocaleString().replace(".", ",");
}