import { TopPlaysfilter } from "../../../models/TopPlaysfilter";

export function topFilterAndSort(top: any, filterOptions: TopPlaysfilter) {

    let error = "";

    if (filterOptions.offset != -1) 
        top = top.splice(filterOptions.offset, 1);

    if (filterOptions.search != "")
        top = top.filter((top: any) => {

            const artist = top.value.beatmapset.artist === undefined ? "" : top.value.beatmapset.artist.toLowerCase();
            const title = top.value.beatmapset.title === undefined ? "" : top.value.beatmapset.title.toLowerCase();
            const version = top.value.beatmap.version === undefined ? "" : top.value.beatmap.version.toLowerCase();
            const creator = top.value.beatmapset.creator === undefined ? "" : top.value.beatmapset.creator.toLowerCase();

            return artist.includes(filterOptions.search) || title.includes(filterOptions.search) || version.includes(filterOptions.search) || creator.includes(filterOptions.search)
        });

    if (filterOptions.mods.length != 0)
        top = top.filter((top: any) => arrayEquals(top.value.mods, filterOptions.mods));

    if (filterOptions.rank.length != 0)
        top = top.filter((top: any) => filterOptions.rank.includes(top.value.rank.toLowerCase()));

    if (filterOptions.acc.length != 0)
        top = top.filter((top: any) => {

            if (filterOptions.acc.length == 1) {

                if (filterOptions.acc[0].includes(">")) {

                    const num = filterOptions.acc[0].replace(">", "");
                    if (isNaN(+num)) {
                        error += "The parameter for `-acc` is not a number\n";
                    } else
                        return top.value.accuracy * 100 >= +num;

                } else if (filterOptions.acc[0].includes("<")) {

                    const num = filterOptions.acc[0].replace("<", "");
                    if (isNaN(+num)) {
                        error += "The parameter for `-acc` is not a number\n";
                    } else
                        return top.value.accuracy * 100 <= +num;

                } else {

                    const num = filterOptions.acc[0];
                    if (isNaN(+num)) {
                        error += "The parameter for `-acc` is not a number\n";
                    } else
                        return top.value.accuracy * 100 == +num;

                }

            } else {

                const numbers: any = [];

                for (let num of filterOptions.acc) {
                    if (isNaN(+num)) {
                        num = num.replace(/\D/g, '');
                        if (isNaN(+num)) {
                            error += "The parameter for `-acc` is not a number\n";
                        } else {
                            numbers.push(+num);
                        }
                    } else {
                        numbers.push(+num);
                    }
                }

                const min = Math.min(...numbers);
                const max = Math.max(...numbers);

                return top.value.accuracy * 100 >= min && top.value.accuracy * 100 <= max;
            }
        });

    if (filterOptions.combo.length != 0)
        top = top.filter((top: any) => {

            if (filterOptions.combo.length == 1) {

                if (filterOptions.combo[0].includes(">")) {

                    const num = filterOptions.combo[0].replace(">", "");
                    if (isNaN(+num)) {
                        error += "The parameter for `-combo` is not a number\n";
                    } else
                        return top.value.max_combo >= +num;

                } else if (filterOptions.combo[0].includes("<")) {

                    const num = filterOptions.combo[0].replace("<", "");
                    if (isNaN(+num)) {
                        error += "The parameter for `-combo` is not a number\n";
                    } else
                        return top.value.max_combo <= +num;

                } else {

                    const num = filterOptions.combo[0];
                    if (isNaN(+num)) {
                        error += "The parameter for `-combo` is not a number\n";
                    } else
                        return top.value.max_combo == +num;

                }

            } else {

                const numbers: any = [];

                for (let num of filterOptions.combo) {
                    if (isNaN(+num)) {
                        num = num.replace(/\D/g, '');
                        if (isNaN(+num)) {
                            error += "The parameter for `-combo` is not a number\n";
                        } else {
                            numbers.push(+num);
                        }
                    } else {
                        numbers.push(+num);
                    }
                }

                const min = Math.min(...numbers);
                const max = Math.max(...numbers);

                return top.value.combo >= min && top.value.combo <= max;
            }
        });

    if (filterOptions.sort == "") { }
    else if (filterOptions.sort == "acc" || filterOptions.sort == "accuracy") {
        top = top.sort((a: any, b: any) => { return a.value.accuracy - b.value.accuracy }).reverse();
    } else if (filterOptions.sort == "combo") {
        top = top.sort((a: any, b: any) => { return a.value.max_combo - b.value.max_combo }).reverse();
    } else if (filterOptions.sort == "length") {
        top = top.sort((a: any, b: any) => {

            let a_length = a.value.beatmap.total_length;
            let b_length = b.value.beatmap.total_length;

            if (a.value.mods.includes("DT") || a.value.mods.includes("NC")) {
                a_length = a_length * 1.5;
            }

            if (b.value.mods.includes("DT") || b.value.mods.includes("NC")) {
                b_length = b_length * 1.5;
            }

            return a_length - b_length
        }).reverse();
    }

    if (filterOptions.reverse) {
        top = top.reverse();
    }

    return top;

}

export function sortAndReverse(top: any, filterOptions: TopPlaysfilter) {
    if (filterOptions.sort == "") { }
    else if (filterOptions.sort == "acc" || filterOptions.sort == "accuracy") {
        top = top.sort((a: any, b: any) => { return a.play.accuracy - b.play.accuracy }).reverse();
    } else if (filterOptions.sort == "combo") {
        top = top.sort((a: any, b: any) => { return a.play.max_combo - b.play.max_combo }).reverse();
    } else if (filterOptions.sort == "length") {
        top = top.sort((a: any, b: any) => {

            let a_length = a.play.beatmap.total_length;
            let b_length = b.play.beatmap.total_length;

            if (a.play.mods.includes("DT") || a.play.mods.includes("NC")) {
                a_length = a_length * 1.5;
            }

            if (b.play.mods.includes("DT") || b.play.mods.includes("NC")) {
                b_length = b_length * 1.5;
            }

            return a_length - b_length
        }).reverse();
    }

    if (filterOptions.reverse) {
        top = top.reverse();
    }

    return top;
}

function arrayEquals(a: any, b: any) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}


