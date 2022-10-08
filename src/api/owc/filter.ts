const { getName } = require('country-list');

export interface owc_filter {
    year: string,
    mode: string,
    keys?: string,
    country?: string
}

export function buildfilter(interaction: any, args: any, default_mode: any) {

    let filter: owc_filter = { year: "2021", mode: default_mode, keys: "4K", country: undefined };

    if (interaction != null) {
        let options = interaction.options;
        filter.year = options.getString("year") === null ? "2021" : options.getString("year")!;
        filter.mode = options.getString("mode") === null ? default_mode : options.getString("mode")!;
        filter.keys = options.getString("keys") === null ? "4K" : options.getString("keys")!;
        if (options.getString("country") !== null) {
            filter.country = getName(options.getString("country"));
            if (filter.country === undefined) {
                filter.country = options.getString("country");
            }
        }
        return filter;
    }

    let mode = "";

    for (let arg of args) {
        if (["-y", "-year", "y", "year"].includes(arg)) {
            mode = "year";
        } else if (["-m", "-mode", "m", "mode"].includes(arg)) {
            mode = "mode";
        } else if (["-k", "-keys", "keys"].includes(arg)) {
            mode = "keys";
        } else if (["-c", "-country", "c", "country"].includes(arg)) {
            mode = "country";
        }

        switch (mode) {
            case "year":
                filter.year = arg;
                break;
            case "mode":
                filter.mode = arg;
                break;
            case "keys":
                if(arg.includes("4")) {
                    filter.keys = "4K";
                } else if(arg.includes("7")) {
                    filter.keys = "7K";
                }
            case "country":
                filter.country = getName(arg);
                if (filter.country === undefined) {
                    filter.country = arg;
                }
                break;
        }
    }

    return filter;

}