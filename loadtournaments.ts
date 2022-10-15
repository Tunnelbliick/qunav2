import { getTournament } from "./src/api/owc/owc"
import owc from "./src/models/owc";
import owcgame from "./src/models/owcgame";

export function loadTournaments() {

    // PLACE Challonge URL HERE

    let tournaments = [
        // Osu
        "owc_2010", //2010
        "owc_2011", //2011
        "owc_2012", //2012
        "owc_2013", //2013
        "owc_2014", //2014
        "new_owc_2015", //2015
        "owc_2016", //2016
        "owc_2017", //2017
        "owc_2018", //2018
        "OWC_2019",
        "OWC_2020",
        "OWC_2021",
        "r8ll3trn",

        // Catch
        "cwc_2012",
        "new_cwc_2013",
        "cwc_2014",
        "cwc_2015",
        "cwc_2016",
        "cwc_2017",
        "cwc_2018",
        "cwc_2019",
        "CWC_2020",
        "CWC_2021",
        "CWC22",

        // Taiko
        "twc_2011", //2011
        "twc_2012", //2012
        "twc_2014", //2014
        "twc_2015", //2015
        "twc_2016", //2016
        "twc_2017", //2017
        "twc_2018", //2018
        "twc_2019", //2019
        "twc_2020", //2020
        "TWC_2021",
        "TWC_2022",

        // Mania 4K
        "MWC4K_2022",
        "MWC4K_2021",
        "MWC4K2020",
        "MWC4K2019",

        // Mania 7k
        "MWC7K_2022",
    ]

    tournaments.forEach((t: any) => {
        getTournament(t);
    })
}

export function ongoingWorldCup() {

    let current_tournament = "r8ll3trn";

    if (current_tournament !== undefined) {
        const updatecurrent = async () => {
            getTournament(current_tournament);
            let current: any = await owc.findOne({ url: current_tournament });

            let matches: any = await owcgame.find({ owc: current.id });

            let current_round = 1;
            let unlocked_round = [1];
            const grouped = groupBy(matches, (match: any) => match.round);

            if (checkIfRoundComplete([1], grouped)) {
                current_round = 2;
                unlocked_round = [2, -1];
            } if (checkIfRoundComplete([2, -1], grouped)) {
                unlocked_round = [3, -2];
                current_round = 3;
            } if (checkIfRoundComplete([3, -2, -3], grouped)) {
                unlocked_round = [4, -4];
                current_round = 4;
            } if (checkIfRoundComplete([4, -4, -5], grouped)) {
                unlocked_round = [5, -5];
                current_round = 5;
            } if (checkIfRoundComplete([5, -6, -7], grouped)) {
                unlocked_round = [6, -6];
                current_round = 6;
            }

            current.current_round = current_round;
            current.unlocked_round = unlocked_round;

            console.log(current_round);

            await current.save();
            await setTimeout(updatecurrent, 1000 * 60);
        }
        updatecurrent();
    }
}

function checkIfRoundComplete(rounds: any[], grouped: Map<any, any>) {

    let iscomplete = true;

    rounds.forEach((round_number: any) => {
        let round = grouped.get(round_number);

        round.forEach((match: any) => {

            if (match.state != "complete") {
                iscomplete = false;
            }

        })

    });

    return iscomplete;

}

function groupBy(list: any, keyGetter: any) {
    const map = new Map();
    list.forEach((item: any) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}
