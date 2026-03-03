import { HouseDetails } from "../types";

const FEATURES = [
    "squareFootage",
    "annualElectricityConsumption",
    "annualEnergyConsumption",
    "annualUtilityBill",
    "yearBuilt",
] as const;

type FeatureKey = (typeof FEATURES)[number];

export function mapHouseDetailsToFeatureRow(details: HouseDetails) {
    return {
        squareFootage: details.squareFootage,
        annualElectricityConsumption: details.annualElectricityConsumption,
        annualEnergyConsumption: details.annualEnergyConsumption,
        annualUtilityBill: details.annualUtilityBill,
        yearBuilt: details.yearBuilt,
    };
}

export function computeMinMax(data: any[]) {
    const stats: Record<string, { min: number; max: number }> = {};

    if (!data || data.length === 0) return stats;

    for (const key of FEATURES) {
        const values = data
            .map((row) => Number(row[key]))
            .filter((v) => Number.isFinite(v));

        if (values.length === 0) {
            stats[key] = { min: 0, max: 0 };
            continue;
        }

        let min = values[0];
        let max = values[0];

        for (const v of values) {
            if (v < min) min = v;
            if (v > max) max = v;
        }

        stats[key] = { min, max };
    }

    return stats;
}

function normalizeRow(
    row: any,
    stats: Record<FeatureKey, { min: number; max: number }>,
) {
    const normalized: Record<FeatureKey, number> = {} as any;

    for (const key of FEATURES) {
        const { min, max } = stats[key];
        normalized[key] = max === min ? 0 : (row[key] - min) / (max - min);
    }

    return normalized;
}

export function nearestNeighbors(
    data: any[],
    target: HouseDetails,
    stats: any,
    k: number = 5,
) {
    const normalizedTarget = normalizeRow(target, stats);

    const distance = (row: any) => {
        const normalizedRow = normalizeRow(row, stats);

        let sum = 0;
        for (const key of FEATURES) {
            const diff = normalizedRow[key] - normalizedTarget[key];
            sum += diff * diff;
        }

        return Math.sqrt(sum);
    };

    const scored = data.map((row) => ({
        row,
        distance: distance(row),
    }));

    scored.sort((a, b) => a.distance - b.distance);

    return scored.slice(0, k).map((item) => item.row);
}
