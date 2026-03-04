import { createContext, useContext, useEffect, useState } from "react";
import { computeMinMax } from "../ml/nearestNeighbor";

interface DatasetContextType {
    buildingData: any[];
    buildingDataStats: any | null;
    retrofitInfo: any[];
    retrofitScoringWeights: any[];
    categoryWeights: any[];
    contractorData: any[];
    loading: boolean;
}

const DatasetContext = createContext<DatasetContextType | null>(null);

export function DatasetProvider({ children }: any) {
    const [buildingData, setBuildingData] = useState<any[]>([]);
    const [buildingDataStats, setBuildingDataStats] = useState<any | null>(null);
    const [retrofitInfo, setRetrofitInfo] = useState<any[]>([]);
    const [retrofitScoringWeights, setRetrofitScoringWeights] = useState<any[]>(
        [],
    );
    const [categoryWeights, setCategoryWeights] = useState<any[]>([]);
    const [contractorData, setContractorData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [a, b, c, d, e] = await Promise.all([
                    fetch("/cleaned_data.json").then((res) => res.json()),
                    fetch("/retrofit_info.json").then((res) => res.json()),
                    fetch("/scoring_weights.json").then((res) => res.json()),
                    fetch("/category_weights.json").then((res) => res.json()),
                    fetch("/contractor_data.json").then((res) => res.json()),
                ]);

                setBuildingData(a);
                setRetrofitInfo(b);
                setRetrofitScoringWeights(c);
                setCategoryWeights(d);
                setContractorData(e);

                if (b && b.length > 0) {
                    const stats = computeMinMax(a);
                    setBuildingDataStats(stats);
                }
            } catch (error) {
                console.error("Dataset loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, []);

    return (
        <DatasetContext.Provider
            value={{
                buildingData,
                buildingDataStats,
                retrofitInfo,
                retrofitScoringWeights,
                categoryWeights,
                contractorData,
                loading,
            }}
        >
            {children}
        </DatasetContext.Provider>
    );
}

export function useDataset() {
    const context = useContext(DatasetContext);

    if (!context) {
        throw new Error("useDataset must be used within DatasetProvider");
    }

    return context;
}
