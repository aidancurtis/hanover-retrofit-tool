import { FuelConsumption } from "../types";

// Standard kWh conversion factors
const KWH_PER_UNIT = {
    naturalGas: 26.8, // per therm
    heatingOil: 40.6, // per gallon
    propane: 26.8, // per gallon
    wood: 5864, // per cord (approx)
};

export function calculateTotalEnergyKwh(fuel: FuelConsumption): number {
    return (
        (fuel.naturalGas ?? 0) * KWH_PER_UNIT.naturalGas +
        (fuel.heatingOil ?? 0) * KWH_PER_UNIT.heatingOil +
        (fuel.propane ?? 0) * KWH_PER_UNIT.propane +
        (fuel.wood ?? 0) * KWH_PER_UNIT.wood +
        (fuel.electricity ?? 0) // already in kWh
    );
}
