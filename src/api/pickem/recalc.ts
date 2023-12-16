import { OwcGame } from "../../interfaces/owcgame";
import { PickemPrediction } from "../../interfaces/pickemPredictions";
import { PickemRegistration } from "../../interfaces/pickemRegistration";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame";
import pickemPrediction from "../../models/pickemPrediction";
import pickemRegistration from "../../models/pickemRegistration";
import { current_tournament } from "./pickem";
import { getPointsForCorrectScore, getPointsForCorrectWinner } from "./predictions";

export async function recalc() {

    const current = await owc.findOne({ url: current_tournament });

    if (!current) {
        return;
    }

    const matches = await owcgame.find({ owc: current.id, state: "complete" });
    const predictionList = await pickemPrediction.find({ owc: current.id });
    const prediction_save_list: any[] = [];
    const registrationList = await pickemRegistration.find({ owc: current.id });

    const registrationMap: Map<String, PickemRegistration> = new Map<String, PickemRegistration>();
    const predictionMap: Map<String, PickemPrediction[]> = new Map<String, PickemPrediction[]>();

    registrationList.forEach((registration: PickemRegistration) => {
        registration.total_score = 0;
        registrationMap.set(registration.id.toString(), registration);
    })

    predictionList.forEach((prediction: PickemPrediction) => {

        let predctions = predictionMap.get(prediction.match.toString());

        if (predctions == null) {
            predctions = [];
        }

        predctions.push(prediction);

        predictionMap.set(prediction.match.toString(), predctions);
    })

    matches.forEach((match: OwcGame) => {

        const predictions = predictionMap.get(match.id.toString());

        if (predictions === undefined) {
            return;
        }

        predictions.forEach((prediction: PickemPrediction) => {

            const registration = registrationMap.get(prediction.registration.toString());

            if (registration) {

                if (prediction.winner_index === match.winner_index) {
                    const points = getPointsForCorrectWinner(match);
                    registration.total_score += points
                }

                if (prediction.score === match.score) {
                    const points = getPointsForCorrectScore(match);
                    registration.total_score += points
                }

                prediction.calculated = true;

                registrationMap.set(registration.id.toString(), registration);
                prediction_save_list.push(prediction);
            }

        })

    });

    const registstration_map: any[] = []

    registrationMap.forEach((value: PickemRegistration, key: String) => {
        registstration_map.push(value);
    })

    await pickemRegistration.bulkSave(registstration_map);
    await pickemPrediction.bulkSave(prediction_save_list);

}