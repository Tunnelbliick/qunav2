const { getName } = require('country-list');

export interface owc_filter {
    year: string,
    country?: string
}

export function buildfilter(interaction: any, args: any) {

    let filter: owc_filter = { year: "2021", country: undefined };

    if (interaction != null) {
        let options = interaction.options;
        filter.year = options.getString("year") === null ? "2021" : options.getString("year")!;
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
        } else if (["-c", "-country", "c", "country"].includes(arg)) {
            mode = "country";
        }

        switch (mode) {
            case "year":
                filter.year = arg;
                break;
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