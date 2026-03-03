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
        retrofitPercentChange,
        categoryWeights,
        contractorData,
        loading,
    } = useDataset();

    const [details, setDetails] = useState<Partial<UserDetails>>({});
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

        // Convert user data
        const userHouseSpecs = mapHouseDetailsToFeatureRow(details.houseDetails);

        // Find nearest house in dataset
        const nn = nearestNeighbors(
            buildingData,
            userHouseSpecs,
            buildingDataStats,
            3,
        );

        const bldg_id = nn[0].bldg_id;

        const scores = scoreRetrofits(
            retrofitPercentChange,
            categoryWeights,
            bldg_id,
            details.preferences,
        );

        const scenarios: RetrofitCategory[] = [];

        // Performance Retrofits
        const performanceRetrofits: Retrofit[] = scores.performanceScores
            .slice(0, 3)
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
                    description: retrofit["short_description"],
                    contractors: [contractor],
                } as Retrofit;
            })
            .filter((r): r is Retrofit => r !== undefined);

        const performance: RetrofitCategory = {
            id: "1",
            title: "Performance",
            description:
                "Selected retrofits that offer the best performance based off your form responses",
            includedRetrofits: performanceRetrofits,
        };

        scenarios.push(performance);

        // Balanced ROI Retrofits
        const balancedROIScores: Retrofit[] = scores.balancedROIScores
            .slice(0, 3)
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
                    description: retrofit["short_description"],
                    includedRetrofits: [],
                    contractors: [contractor],
                } as Retrofit;
            })
            .filter((r): r is Retrofit => r !== undefined);

        const balancedROI: RetrofitCategory = {
            id: "2",
            title: "Balanced ROI",
            description:
                "Selected retrofits that offer the best return on investment based off your form responses",
            includedRetrofits: balancedROIScores,
        };

        scenarios.push(balancedROI);

        // Fast and Practical Retrofits
        const fastPracticalRetrofits: Retrofit[] = scores.fastPracticalScores
            .slice(0, 3)
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
                    description: retrofit["short_description"],
                    includedRetrofits: [],
                    contractors: [contractor],
                } as Retrofit;
            })
            .filter((r): r is Retrofit => r !== undefined);

        const fastPractical: RetrofitCategory = {
            id: "3",
            title: "Fast and Practical",
            description:
                "Selected retrofits that are the most fast and practical based off your form responses",
            includedRetrofits: fastPracticalRetrofits,
        };

        scenarios.push(fastPractical);

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
