import { UserPreferences } from "../types";

function computeWeights(preferences: UserPreferences) {
    const weights: UserPreferences = {
        energyConsumption: 0,
        emissions: 0,
        operatingCost: 0,
        upfrontCost: 0,
        paybackPeriod: 0,
        comfort: 0,
        timeline: 0,
        invasiveness: 0,
    };

    if (
        preferences.energyConsumption == null ||
        preferences.emissions == null ||
        preferences.operatingCost == null ||
        preferences.upfrontCost == null ||
        preferences.paybackPeriod == null ||
        preferences.comfort == null ||
        preferences.timeline == null ||
        preferences.invasiveness == null
    ) {
        return;
    }

    // Performance weights
    const perfSum = preferences.energyConsumption + preferences.emissions;
    if (perfSum !== 0) {
        weights.energyConsumption = preferences.energyConsumption / perfSum;
        weights.emissions = preferences.emissions / perfSum;
    }

    // Financial weights
    const finSum =
        preferences.operatingCost +
        preferences.upfrontCost +
        preferences.paybackPeriod;
    if (finSum !== 0) {
        weights.operatingCost = preferences.operatingCost / finSum;
        weights.upfrontCost = preferences.upfrontCost / finSum;
        weights.paybackPeriod = preferences.paybackPeriod / finSum;
    }

    // Practicality weights
    const pracSum =
        preferences.comfort + preferences.timeline + preferences.invasiveness;
    if (pracSum !== 0) {
        weights.comfort = preferences.comfort / pracSum;
        weights.timeline = preferences.timeline / pracSum;
        weights.invasiveness = preferences.invasiveness / pracSum;
    }

    return weights;
}

function computeScore(
    retrofitWeights: UserPreferences,
    preferenceWeights: UserPreferences,
) {
    if (
        retrofitWeights.energyConsumption == null ||
        retrofitWeights.emissions == null ||
        retrofitWeights.operatingCost == null ||
        retrofitWeights.upfrontCost == null ||
        retrofitWeights.paybackPeriod == null ||
        retrofitWeights.comfort == null ||
        retrofitWeights.timeline == null ||
        retrofitWeights.invasiveness == null
    ) {
        console.log("Retrofit weights null");
        return;
    }

    if (
        preferenceWeights.energyConsumption == null ||
        preferenceWeights.emissions == null ||
        preferenceWeights.operatingCost == null ||
        preferenceWeights.upfrontCost == null ||
        preferenceWeights.paybackPeriod == null ||
        preferenceWeights.comfort == null ||
        preferenceWeights.timeline == null ||
        preferenceWeights.invasiveness == null
    ) {
        console.log("Retrofit weights null");
        return;
    }

    // console.log("Retrofit weights: ", retrofitWeights);
    // console.log("Preference weights: ", preferenceWeights);

    const perf =
        preferenceWeights.energyConsumption * retrofitWeights.energyConsumption +
        preferenceWeights.emissions * retrofitWeights.emissions;

    const fin =
        preferenceWeights.operatingCost * retrofitWeights.operatingCost +
        preferenceWeights.upfrontCost * retrofitWeights.upfrontCost +
        preferenceWeights.paybackPeriod * retrofitWeights.paybackPeriod;

    const prac =
        preferenceWeights.timeline * retrofitWeights.timeline +
        preferenceWeights.invasiveness * retrofitWeights.invasiveness +
        preferenceWeights.comfort * retrofitWeights.comfort;

    // console.log("Perf: ", perf);

    const performance = 0.7 * perf + 0.1 * fin + 0.2 * prac;
    const balancedROI = 0.3 * perf + 0.5 * fin + 0.2 * prac;
    const fastPractical = 0.2 * perf + 0.2 * fin + 0.6 * prac;

    return { performance, balancedROI, fastPractical };
}

export function scoreRetrofits(
    retrofitScoringWeights: any[],
    categoryWeights: any[],
    bldg_id: number,
    preferences: UserPreferences,
) {
    // Get row from retrofitPercentChange
    const result = retrofitScoringWeights.find(
        (item) => item.bldg_id === bldg_id,
    );

    // Map retrofits by id
    const map = new Map();
    categoryWeights.forEach((item) => map.set(item.id, item));

    // Convert preferences to weights
    const preferenceWeights = computeWeights(preferences);

    if (preferenceWeights == undefined) {
        console.log("Preference weights undefined");
        return;
    }

    let performanceScores: number[][] = [];
    let balancedROIScores: number[][] = [];
    let fastPracticalScores: number[][] = [];

    for (const id of map.keys()) {
        const item = map.get(id);

        const retrofitWeights: UserPreferences = {
            energyConsumption: result[`upgrade${id}_energy`],
            emissions: result[`upgrade${id}_emissions`],
            operatingCost: result[`upgrade${id}_utility`],
            upfrontCost: item.upfrontCost,
            paybackPeriod: result[`upgrade${id}_payback_period`],
            comfort: item.comfort,
            timeline: item.timeline,
            invasiveness: item.invasiveness,
        };

        // console.log(`Retrofit ${id} weights: `, retrofitWeights);

        const scores = computeScore(retrofitWeights, preferenceWeights);

        // console.log(`Scores Upgrade ${id}: `, scores);

        if (scores == undefined) {
            console.log("Score undefined");
            return;
        }

        performanceScores.push([id, scores.performance]);
        balancedROIScores.push([id, scores.balancedROI]);
        fastPracticalScores.push([id, scores.fastPractical]);
    }

    performanceScores.sort((a, b) => b[1] - a[1]);
    balancedROIScores.sort((a, b) => b[1] - a[1]);
    fastPracticalScores.sort((a, b) => b[1] - a[1]);

    console.log("Performance Scores: ", performanceScores);
    console.log("Balanced ROI Scores: ", balancedROIScores);
    console.log("Fast and Practical Scores: ", fastPracticalScores);

    return { performanceScores, balancedROIScores, fastPracticalScores };
}
