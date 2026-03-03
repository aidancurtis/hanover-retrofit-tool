export interface UserDetails {
    houseDetails: HouseDetails;
    preferences: UserPreferences;
}
export interface HouseDetails {
    squareFootage: number;
    yearBuilt: number;
    annualEnergyConsumption: number;
    annualElectricityConsumption: number;
    annualUtilityBill: number;
}

export interface UserPreferences {
    energyConsumption: number;
    emissions: number;
    operatingCost: number;
    upfrontCost: number;
    paybackPeriod: number;
    comfort: number;
    timeline: number;
    invasiveness: number;
}

export interface Retrofit {
    id: number;
    title: string;
    description: string;
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
