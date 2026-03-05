export interface UserDetails {
    houseDetails: HouseDetails | null;
    preferences: UserPreferences | null;
}

export interface FuelConsumption {
    naturalGas?: number; // therms or CCF
    heatingOil?: number; // gallons
    propane?: number; // gallons
    wood?: number; // cords
    electricity?: number; // kWh
}

export interface HouseDetails {
    squareFootage: number;
    yearBuilt: number;
    primaryHeatingSource?: string;
    fuelConsumption?: FuelConsumption;
    annualEnergyConsumption: number;
    annualElectricityConsumption: number;
    annualUtilityBill: number;
}

export interface UserPreferences {
    energyConsumption: number | null;
    emissions: number | null;
    operatingCost: number | null;
    upfrontCost: number | null;
    paybackPeriod: number | null;
    comfort: number | null;
    timeline: number | null;
    invasiveness: number | null;
}

export interface Retrofit {
    id: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    contractors: Contractor[];
}

export interface RetrofitCategory {
    id: string;
    title: string;
    description: string;
    includedRetrofits: Retrofit[];
}

export interface Contractor {
    name: string;
    number: string;
    address: string;
    website: string;
}
