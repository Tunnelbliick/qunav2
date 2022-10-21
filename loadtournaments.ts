import { getTournament } from "./src/api/owc/owc"
import { current_tournament } from "./src/api/pickem/pickem";
import owc from "./src/models/owc";
import owcgame from "./src/models/owcgame";
import pickemPrediction from "./src/models/pickemPrediction";
import pickemRegistration from "./src/models/pickemRegistration";

export async function loadTournaments() {

    // PLACE Challonge URL HERE

    const tournaments = [
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
        "OWC22",

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

    tournaments.forEach(async (t: any) => {
        await getTournament(t);
    })
}

export  function ongoingWorldCup() {

    if (current_tournament !== undefined) {
        const updatecurrent = async () => {
            await getTournament(current_tournament!);
            const current: any = await owc.findOne({ url: current_tournament });
            const matches: any = await owcgame.find({ owc: current.id });

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
            calculateScores();
            await setTimeout(updatecurrent, 1000 * 60 * 10);
        }
        updatecurrent();
    }
}

function checkIfRoundComplete(rounds: any[], grouped: Map<any, any>) {

    let iscomplete = true;

    rounds.forEach((round_number: any) => {
        const round = grouped.get(round_number);

        round.forEach((match: any) => {

            if (match.state != "complete") {
                iscomplete = false;
            }

        })

    });

    return iscomplete;

}

async function calculateScores() {
    const current: any = await owc.findOne({ url: current_tournament });

    if(current === undefined) {
        return;
    }

    const matches: any = await owcgame.find({ owc: current.id, state: "complete" });
    const predictionList: any = await pickemPrediction.find({ owc: current.id, calculated: false });
    const prediction_save_list: any[] = [];
    const registrationList: any = await pickemRegistration.find({ owc: current.id });

    const registrationMap: Map<any, any> = new Map<any, any>();
    const predictionMap: Map<any, any[]> = new Map<any, any[]>();

    registrationList.forEach((registration: any) => {
        registrationMap.set(registration.id, registration);
    })

    predictionList.forEach((prediction: any) => {

        let predctions = predictionMap.get(prediction.match.toString());

        if (predctions == null) {
            predctions = [];
        }

        predctions.push(prediction);

        predictionMap.set(prediction.match.toString(), predctions);
    })

    matches.forEach((match: any) => {

        const predictions = predictionMap.get(match.id);

        if (predictions === undefined) {
            return;
        }

        predictions.forEach((prediction: any) => {

            const registration = registrationMap.get(prediction.registration.toString());

            if (registration === undefined) {
                return;
            }

            if (prediction.winner_index === match.winner_index) {
                registration.total_score += 1;
            }

            if (prediction.score === match.score) {
                registration.total_score += 3;
            }

            prediction.calculated = true;

            registrationMap.set(registration.id, registration);
            prediction_save_list.push(prediction);

            console.log(prediction);

        })

    });

    await pickemRegistration.bulkSave(Array.from(registrationMap.values()));
    await pickemPrediction.bulkSave(prediction_save_list);

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
