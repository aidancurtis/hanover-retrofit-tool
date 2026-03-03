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

    // Performance weights
    weights.energyConsumption =
        preferences.energyConsumption /
        (preferences.energyConsumption + preferences.emissions);
    weights.emissions =
        preferences.emissions /
        (preferences.energyConsumption + preferences.emissions);

    // Financial weights
    weights.operatingCost =
        preferences.operatingCost /
        (preferences.operatingCost +
            preferences.upfrontCost +
            preferences.paybackPeriod);
    weights.upfrontCost =
        preferences.upfrontCost /
        (preferences.operatingCost +
            preferences.upfrontCost +
            preferences.paybackPeriod);
    weights.paybackPeriod =
        preferences.paybackPeriod /
        (preferences.operatingCost +
            preferences.upfrontCost +
            preferences.paybackPeriod);

    // Practicality weights
    weights.comfort =
        preferences.comfort /
        (preferences.comfort + preferences.timeline + preferences.invasiveness);
    weights.timeline =
        preferences.comfort /
        (preferences.comfort + preferences.timeline + preferences.invasiveness);
    weights.invasiveness =
        preferences.comfort /
        (preferences.comfort + preferences.timeline + preferences.invasiveness);

    return weights;
}

function computeScore(
    retrofitWeights: UserPreferences,
    preferenceWeights: UserPreferences,
) {
    const perf =
        preferenceWeights.energyConsumption * retrofitWeights.energyConsumption +
        preferenceWeights.emissions * retrofitWeights.emissions;

    const fin =
        preferenceWeights.operatingCost * retrofitWeights.operatingCost -
        preferenceWeights.upfrontCost * retrofitWeights.upfrontCost -
        preferenceWeights.paybackPeriod * retrofitWeights.paybackPeriod;

    const prac =
        preferenceWeights.timeline * retrofitWeights.timeline +
        preferenceWeights.invasiveness * retrofitWeights.invasiveness +
        preferenceWeights.comfort * retrofitWeights.comfort;

    const performance = 0.7 * perf + 0.1 * fin + 0.2 * prac;
    const balancedROI = 0.3 * perf + 0.5 * fin + 0.2 * prac;
    const fastPractical = 0.2 * perf + 0.2 * fin + 0.6 * prac;

    return { performance, balancedROI, fastPractical };
}

export function scoreRetrofits(
    retrofitPercentChange: any[],
    categoryWeights: any[],
    bldg_id: number,
    preferences: UserPreferences,
) {
    // Get row from retrofitPercentChange
    const result = retrofitPercentChange.find((item) => item.bldg_id === bldg_id);

    // Map retrofits by id
    const map = new Map();
    categoryWeights.forEach((item) => map.set(item.id, item));

    // Convert preferences to weights
    const preferenceWeights = computeWeights(preferences);

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
            paybackPeriod: 0,
            comfort: item.comfort,
            timeline: item.timeline,
            invasiveness: item.invasiveness,
        };

        const scores = computeScore(retrofitWeights, preferenceWeights);

        performanceScores.push([id, scores.performance]);
        balancedROIScores.push([id, scores.balancedROI]);
        fastPracticalScores.push([id, scores.fastPractical]);
    }

    performanceScores.sort((a, b) => b[1] - a[1]);
    balancedROIScores.sort((a, b) => b[1] - a[1]);
    fastPracticalScores.sort((a, b) => b[1] - a[1]);

    return { performanceScores, balancedROIScores, fastPracticalScores };
}
