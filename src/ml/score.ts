import { UserPreferences } from "../types";

function computeWeights(preferences: UserPreferences) {
    console.log(preferences);
    if (
        preferences.energyConsumption == null ||
        preferences.emissions == null ||
        preferences.operatingCost == null
    ) {
        return;
    }

    const preferencesSum =
        preferences.energyConsumption +
        preferences.emissions +
        preferences.operatingCost;

    const weights = {
        energyConsumption: preferences.energyConsumption / preferencesSum,
        emissions: preferences.emissions / preferencesSum,
        utility: preferences.operatingCost / preferencesSum,
    };

    console.log("Weights: ", weights);

    // // Performance weights
    // const perfSum = preferences.energyConsumption + preferences.emissions;
    // if (perfSum !== 0) {
    //     weights.energyConsumption = preferences.energyConsumption / perfSum;
    //     weights.emissions = preferences.emissions / perfSum;
    // }
    //
    // // Financial weights
    // const finSum =
    //     preferences.operatingCost +
    //     preferences.upfrontCost +
    //     preferences.paybackPeriod;
    // if (finSum !== 0) {
    //     weights.operatingCost = preferences.operatingCost / finSum;
    //     weights.upfrontCost = preferences.upfrontCost / finSum;
    //     weights.paybackPeriod = preferences.paybackPeriod / finSum;
    // }
    //
    // // Practicality weights
    // const pracSum =
    //     preferences.comfort + preferences.timeline + preferences.invasiveness;
    // if (pracSum !== 0) {
    //     weights.comfort = preferences.comfort / pracSum;
    //     weights.timeline = preferences.timeline / pracSum;
    //     weights.invasiveness = preferences.invasiveness / pracSum;
    // }

    return weights;
}

function computeScore(
    retrofitWeights: Record<string, number>,
    preferenceWeights: Record<string, number>,
) {
    if (
        retrofitWeights.energyConsumption == null ||
        retrofitWeights.emissions == null ||
        retrofitWeights.utility == null
    ) {
        console.log("Retrofit weights null");
        return;
    }

    if (
        preferenceWeights.energyConsumption == null ||
        preferenceWeights.emissions == null ||
        preferenceWeights.utility == null
    ) {
        console.log("Preference weights null");
        return;
    }

    // console.log("Retrofit weights: ", retrofitWeights);
    // console.log("Preference weights: ", preferenceWeights);

    const score = Object.keys(retrofitWeights).reduce((sum, key) => {
        return sum + retrofitWeights[key] * (preferenceWeights[key] ?? 0);
    }, 0);

    return score;
}

export function scoreRetrofits(
    retrofitScoringWeights: any[],
    categoryWeights: any[],
    bldg_ids: any[],
    preferences: UserPreferences,
) {
    // Get row from retrofitPercentChange
    const results = bldg_ids.map((bldg_id) =>
        retrofitScoringWeights.find((item) => item.bldg_id === bldg_id),
    );

    console.log("Results: ", results);

    // Map retrofits by id
    const map = new Map();
    categoryWeights.forEach((item) => map.set(item.id, item));

    // Convert preferences to weights
    const preferenceWeights = computeWeights(preferences);

    if (preferenceWeights == undefined) {
        console.log("Preference weights undefined");
        return;
    }

    let scores: Record<number, number[]> = {};

    for (const res of results) {
        for (const id of map.keys()) {
            const item = map.get(id);

            // const energyConsumption = results.map((res) => res[`upgrade${id}_energy`]);
            // const energyConsumptionAvg =
            //     energyConsumption.reduce((sum, val) => sum + val, 0) /
            //     energyConsumption.length;
            //
            // const emissionsConsumption = results.map(
            //     (res) => res[`upgrade${id}_emissions`],
            // );
            // const emissionsConsumptionAvg =
            //     emissionsConsumption.reduce((sum, val) => sum + val, 0) /
            //     energyConsumption.length;
            //
            // const utility = results.map((res) => res[`upgrade${id}_utility`]);
            // const utilityAvg =
            //     utility.reduce((sum, val) => sum + val, 0) / energyConsumption.length;
            //
            //

            // console.log("Res: ", res);
            const energyConsumption = res[`upgrade${id}_energy`];
            const emissionsConsumption = res[`upgrade${id}_emissions`];
            const utility = res[`upgrade${id}_utility`];

            const retrofitWeights = {
                energyConsumption: energyConsumption,
                emissions: emissionsConsumption,
                utility: utility,
            };

            const score = computeScore(retrofitWeights, preferenceWeights);

            if (score == 1 || score == undefined) {
                console.log(`Retrofit ${id} score 1`);
                continue;
            }

            console.log(`Score Upgrade ${id}: `, score);

            if (scores == undefined) {
                console.log("Score undefined");
                return;
            }

            if (!scores[id]) {
                scores[id] = [];
            }

            if (scores[id].length < 5) {
                scores[id].push(score);
            }
        }
    }

    console.log("Raw scores: ", scores);

    const averagedScores: [number, number][] = Object.entries(scores).map(
        ([key, scoreList]) => {
            const average =
                scoreList.reduce((sum, val) => sum + val, 0) / scoreList.length;
            return [Number(key), average];
        },
    );

    const allowedIds = [18, 6, 7, 8];

    const firstMatch = averagedScores.find(([key]) => allowedIds.includes(key));

    const filteredScores = averagedScores.filter(
        ([key]) => !allowedIds.includes(key) || key === firstMatch?.[0],
    );

    filteredScores.sort((a, b) => b[1] - a[1]);

    console.log("Averaged scores: ", averagedScores);
    console.log("Filtered scores: ", filteredScores);

    return filteredScores;
}
