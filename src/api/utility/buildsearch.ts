import { suggestion_filter } from "../recommend/showsuggestions/filter";

export function buildSearch(filter: suggestion_filter): any {

    const upvote = filter.userid;
    const searchString = filter.searchString;
    const ar = filter.ar;
    const hp = filter.hp;
    const cs = filter.cs;
    const od = filter.od;
    const star = filter.star;
    const bpm = filter.bpm;
    const category = filter.category;

    let error = "";

    let query: any = {};

    if (upvote != undefined) {
        query["upvote"] = parseInt(upvote);
    }

    if (searchString != "") {
        query["$or"] = [{ title: { $regex: searchString } }, { artist: { $regex: searchString } }, { version: { $regex: searchString } }, { creator: { $regex: searchString } }, { type: { $regex: searchString } }];
    }

    if (category != undefined) {
        query["type.category"] = { "$in": category }
    }

    if (ar.length != 0) {
        if (ar.length == 1) {
            if (ar[0].includes(">")) {
                let num = ar[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-ar` is not a number\n";
                } else
                    query["ar"] = { $lte: +num };
            } else if (ar[0].includes("<")) {
                let num = ar[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-ar` is not a number\n";
                } else
                    query["ar"] = { $gte: +num };
            } else {
                let num = ar[0];
                if (isNaN(+ar)) {
                    error += "The parameter for `-ar` is not a number\n";
                } else
                    query["ar"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of ar) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-ar` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["ar"] = { $gte: min, $lte: max };

        }
    }

    if (hp.length != 0) {
        if (hp.length == 1) {
            if (hp[0].includes(">")) {
                let num = hp[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-hp` is not a number\n";
                } else
                    query["hp"] = { $lte: +num };
            } else if (hp[0].includes("<")) {
                let num = hp[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-hp` is not a number\n";
                } else
                    query["hp"] = { $gte: +num };
            } else {
                let num = hp[0];
                if (isNaN(+hp)) {
                    error += "The parameter for `-hp` is not a number\n";
                } else
                    query["hp"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of hp) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-hp` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["hp"] = { $gte: min, $lte: max };

        }
    }

    if (od.length != 0) {
        if (od.length == 1) {
            if (od[0].includes(">")) {
                let num = od[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-od` is not a number\n";
                } else
                    query["od"] = { $lte: +num };
            } else if (od[0].includes("<")) {
                let num = od[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-od` is not a number\n";
                } else
                    query["od"] = { $gte: +num };
            } else {
                let num = od[0];
                if (isNaN(+od)) {
                    error += "The parameter for `-od` is not a number\n";
                } else
                    query["od"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of od) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-od` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["od"] = { $gte: min, $lte: max };

        }
    }

    if (cs.length != 0) {
        if (cs.length == 1) {
            if (cs[0].includes(">")) {
                let num = cs[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-cs` is not a number\n";
                } else
                    query["cs"] = { $lte: +num };
            } else if (cs[0].includes("<")) {
                let num = cs[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-cs` is not a number\n";
                } else
                    query["cs"] = { $gte: +num };
            } else {
                let num = cs[0];
                if (isNaN(+cs)) {
                    error += "The parameter for `-cs` is not a number\n";
                } else
                    query["cs"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of cs) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-cs` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["cs"] = { $gte: min, $lte: max };

        }
    }

    if (bpm.length != 0) {
        if (bpm.length == 1) {
            if (bpm[0].includes(">")) {
                let num = bpm[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-bpm` is not a number\n";
                } else
                    query["bpm"] = { $lte: +num };
            } else if (bpm[0].includes("<")) {
                let num = bpm[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-bpm` is not a number\n";
                } else
                    query["bpm"] = { $gte: +num };
            } else {
                let num = bpm[0];
                if (isNaN(+bpm)) {
                    error += "The parameter for `-bpm` is not a number\n";
                } else
                    query["bpm"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of bpm) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-bpm` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["bpm"] = { $gte: min, $lte: max };

        }
    }

    if (star.length != 0) {
        if (star.length == 1) {
            if (star[0].includes(">")) {
                let num = star[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-star` is not a number\n";
                } else
                    query["star"] = { $lte: +num };
            } else if (star[0].includes("<")) {
                let num = star[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-star` is not a number\n";
                } else
                    query["star"] = { $gte: +num };
            } else {
                let num = star[0];
                if (isNaN(+star)) {
                    error += "The parameter for `-star` is not a number\n";
                } else
                    query["star"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of star) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-star` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["star"] = { $gte: min, $lte: max };

        }
    }

    if (error.length != 0) {
        throw error;
    }

    return query;

}


export function buildSearchForRequest(searchString: string, type: any, ar: any, cs: any, od: any, hp: any, bpm: any, star: any): any {

    let error = "";

    let query: any = {};

    if (searchString != "") {
        query["$or"] = [{ title: { $regex: searchString } }, { artist: { $regex: searchString } }, { version: { $regex: searchString } }, { creator: { $regex: searchString } }, { type: { $regex: searchString } }];
    }

    if (type.length != 0) {
        let typequery = [];

        for (let t of type)
            typequery.push({ "type.type": t.toLowerCase() });

        query["$and"] = typequery;
    }

    if (ar.length != 0) {
        if (ar.length == 1) {
            if (ar[0].includes(">")) {
                let num = ar[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-ar` is not a number\n";
                } else
                    query["ar"] = { $lte: +num };
            } else if (ar[0].includes("<")) {
                let num = ar[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-ar` is not a number\n";
                } else
                    query["ar"] = { $gte: +num };
            } else {
                let num = ar[0];
                if (isNaN(+ar)) {
                    error += "The parameter for `-ar` is not a number\n";
                } else
                    query["ar"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of ar) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-ar` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["ar"] = { $gte: min, $lte: max };

        }
    }

    if (hp.length != 0) {
        if (hp.length == 1) {
            if (hp[0].includes(">")) {
                let num = hp[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-hp` is not a number\n";
                } else
                    query["hp"] = { $lte: +num };
            } else if (hp[0].includes("<")) {
                let num = hp[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-hp` is not a number\n";
                } else
                    query["hp"] = { $gte: +num };
            } else {
                let num = hp[0];
                if (isNaN(+hp)) {
                    error += "The parameter for `-hp` is not a number\n";
                } else
                    query["hp"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of hp) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-hp` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["hp"] = { $gte: min, $lte: max };

        }
    }

    if (od.length != 0) {
        if (od.length == 1) {
            if (od[0].includes(">")) {
                let num = od[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-od` is not a number\n";
                } else
                    query["od"] = { $lte: +num };
            } else if (od[0].includes("<")) {
                let num = od[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-od` is not a number\n";
                } else
                    query["od"] = { $gte: +num };
            } else {
                let num = od[0];
                if (isNaN(+od)) {
                    error += "The parameter for `-od` is not a number\n";
                } else
                    query["od"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of od) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-od` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["od"] = { $gte: min, $lte: max };

        }
    }

    if (cs.length != 0) {
        if (cs.length == 1) {
            if (cs[0].includes(">")) {
                let num = cs[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-cs` is not a number\n";
                } else
                    query["cs"] = { $lte: +num };
            } else if (cs[0].includes("<")) {
                let num = cs[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-cs` is not a number\n";
                } else
                    query["cs"] = { $gte: +num };
            } else {
                let num = cs[0];
                if (isNaN(+cs)) {
                    error += "The parameter for `-cs` is not a number\n";
                } else
                    query["cs"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of cs) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-cs` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["cs"] = { $gte: min, $lte: max };

        }
    }

    if (bpm.length != 0) {
        if (bpm.length == 1) {
            if (bpm[0].includes(">")) {
                let num = bpm[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-bpm` is not a number\n";
                } else
                    query["bpm"] = { $lte: +num };
            } else if (bpm[0].includes("<")) {
                let num = bpm[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-bpm` is not a number\n";
                } else
                    query["bpm"] = { $gte: +num };
            } else {
                let num = bpm[0];
                if (isNaN(+bpm)) {
                    error += "The parameter for `-bpm` is not a number\n";
                } else
                    query["bpm"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of bpm) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-bpm` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["bpm"] = { $gte: min, $lte: max };

        }
    }

    if (star.length != 0) {
        if (star.length == 1) {
            if (star[0].includes(">")) {
                let num = star[0].replace(">", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-star` is not a number\n";
                } else
                    query["star"] = { $lte: +num };
            } else if (star[0].includes("<")) {
                let num = star[0].replace("<", "");
                if (isNaN(+num)) {
                    error += "The parameter for `-star` is not a number\n";
                } else
                    query["star"] = { $gte: +num };
            } else {
                let num = star[0];
                if (isNaN(+star)) {
                    error += "The parameter for `-star` is not a number\n";
                } else
                    query["star"] = +num;
            }
        } else {
            let numbers: any = [];

            for (let num of star) {
                if (isNaN(+num)) {
                    num = num.replace(/\D/g, '');
                    if (isNaN(+num)) {
                        error += "The parameter for `-star` is not a number\n";
                    } else {
                        numbers.push(+num);
                    }
                } else {
                    numbers.push(+num);
                }
            }

            let min = Math.min(...numbers);
            let max = Math.max(...numbers);

            query["star"] = { $gte: min, $lte: max };

        }
    }

    if (error.length != 0) {
        throw error;
    }

    return query;

}