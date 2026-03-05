import { createContext, useContext, useState, ReactNode } from "react";
import { UserDetails, Retrofit, RetrofitCategory } from "../types";

import { useDataset } from "../context/DatasetContext";

import {
    mapHouseDetailsToFeatureRow,
    nearestNeighbors,
} from "../ml/nearestNeighbor";

import { scoreRetrofits } from "../ml/score";

interface UserDetailsContextType {
    details: Partial<UserDetails>;
    updateDetails: (updates: Partial<UserDetails>) => void;
    retrofitOptions: RetrofitCategory[];
    calculateRetrofitOptions: () => void;
}

const UserDetailsContext = createContext<UserDetailsContextType | undefined>(
    undefined,
);

export function UserDetailsProvider({ children }: { children: ReactNode }) {
    const {
        buildingData,
        buildingDataStats,
        retrofitInfo,
        retrofitScoringWeights,
        categoryWeights,
        contractorData,
        loading,
    } = useDataset();

    const [details, setDetails] = useState<Partial<UserDetails>>({
        preferences: null,
        houseDetails: null,
    });

    const [retrofitOptions, setRetrofitOptions] = useState<RetrofitCategory[]>(
        [],
    );

    const updateDetails = (updates: Partial<UserDetails>) => {
        setDetails((prev) => ({ ...prev, ...updates }));
    };

    const calculateRetrofitOptions = () => {
        if (loading) {
            console.log("Dataset not loaded yet");
            return;
        }

        if (!details.houseDetails) return;
        if (!details.preferences) return;

        const fuelValues = Object.values(
            details.houseDetails.fuelConsumption ?? {},
        );
        const allEmpty =
            fuelValues.length === 0 || fuelValues.every((v) => !v && v !== false);

        if (allEmpty) {
            switch (details.houseDetails.primaryHeatingSource) {
                case "natural-gas":
                    details.houseDetails.annualEnergyConsumption =
                        20.98 * details.houseDetails.squareFootage;
                    break;
                case "oil":
                    details.houseDetails.annualEnergyConsumption =
                        18.87 * details.houseDetails.squareFootage;
                    break;
                case "propane":
                    details.houseDetails.annualEnergyConsumption =
                        19.71 * details.houseDetails.squareFootage;
                    break;
                case "wood":
                    details.houseDetails.annualEnergyConsumption =
                        5.35 * details.houseDetails.squareFootage;
                    break;
                default:
                    console.log("Primary heating source is unknown or not set");
                    break;
            }
        }

        console.log(details.houseDetails.annualEnergyConsumption);

        // Convert user data
        const userHouseSpecs = mapHouseDetailsToFeatureRow(details.houseDetails);

        // Find nearest house in dataset
        const nn = nearestNeighbors(
            buildingData,
            userHouseSpecs,
            buildingDataStats,
            10,
        );

        console.log("Nearest Neighbors: ", nn);

        const bldg_ids = nn.map((e) => e["bldg_id"]);

        console.log("detailsprefs, ", details.preferences);

        const scores = scoreRetrofits(
            retrofitScoringWeights,
            categoryWeights,
            bldg_ids,
            details.preferences,
        );

        if (scores == undefined) {
            console.log("Scores undefined");
            return;
        }

        const scenarios: RetrofitCategory[] = [];

        // Top scores from averages
        const optimalRetrofitSuggestions: Retrofit[] = scores
            .slice(0, 5)
            .map(([id, _]) => {
                const retrofit = retrofitInfo.find((r) => {
                    const key = Object.keys(r).find((k) => k.includes("upgrade"));
                    return key ? Number(r[key]) === Number(id) : false;
                });

                const contractor = contractorData.find((r) => {
                    const key = Object.keys(r).find((k) => k.includes("id"));
                    return key ? Number(r[key]) === Number(id) : false;
                });

                if (!retrofit) return undefined;
                return {
                    id: retrofit["upgrade"],
                    title: retrofit["short.upgrade_name"],
                    shortDescription: retrofit["short_description"],
                    longDescription: retrofit["long_description"],
                    contractors: [contractor],
                } as Retrofit;
            })
            .filter((r): r is Retrofit => r !== undefined);

        const optimalRetrofits: RetrofitCategory = {
            id: "0",
            title: "Top Retrofit Suggestions",
            description:
                "Selected retrofits based on combination of information from ResStock dataset and your preferences",
            includedRetrofits: optimalRetrofitSuggestions,
        };

        scenarios.push(optimalRetrofits);

        setRetrofitOptions(scenarios);
    };
    return (
        <UserDetailsContext.Provider
            value={{
                details,
                updateDetails,
                retrofitOptions,
                calculateRetrofitOptions,
            }}
        >
            {children}
        </UserDetailsContext.Provider>
    );
}

export function useUserDetails() {
    const context = useContext(UserDetailsContext);
    if (!context) {
        throw new Error("useUserDetails must be used within UserDetailsProvider");
    }
    return context;
}
