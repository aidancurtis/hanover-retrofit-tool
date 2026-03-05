import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
    TrendingDown,
    Leaf,
    Zap,
    Phone,
    Mail,
    Wrench,
    DollarSign,
    Send,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { generateRetrofitPDF } from "./PDFExport";
import { useUserDetails } from "../context/UserDetailsContext";
import { useState } from "react";

import { RetrofitCategory } from "../types";

interface RetrofitResultsProps {
    options: RetrofitCategory[];
}

export function RetrofitResults({ options }: RetrofitResultsProps) {
    const [expandedRetrofits, setExpandedRetrofits] = useState<Set<string>>(
        new Set(),
    );

    const toggleExpanded = (optionId: string, retrofitIndex: number) => {
        const key = `${optionId}-${retrofitIndex}`;
        setExpandedRetrofits((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const isExpanded = (optionId: string, retrofitIndex: number) => {
        return expandedRetrofits.has(`${optionId}-${retrofitIndex}`);
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case "Performance":
                return <Leaf className="w-6 h-6 text-green-600" />;
            case "Balanced ROI":
                return <DollarSign className="w-6 h-6 text-blue-600" />;
            case "Fast and Practical":
                return <Zap className="w-6 h-6 text-orange-600" />;
            default:
                return null;
        }
    };

    const getCategoryColor = (type: string) => {
        switch (type) {
            case "Performance":
                return "border-green-200 bg-green-50";
            case "Balanced ROI":
                return "border-blue-200 bg-blue-50";
            case "Fast and Practical":
                return "border-orange-200 bg-orange-50";
            default:
                return "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-green-600" />
                <h2>Retrofit Suggestions</h2>
            </div>

            <div className="space-y-4">
                {options.map((option) => (
                    <Card
                        key={option.id}
                        className={`p-6 ${getCategoryColor(option.title)} flex flex-col`}
                    >
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                {getCategoryIcon(option.title)}
                                <div className="flex-1">
                                    <h3 className="mb-1">{option.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t space-y-4">
                                <h4 className="font-semibold">Recommended Retrofits</h4>

                                {option.includedRetrofits.map((retrofit, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg border p-4 space-y-3"
                                    >
                                        {/* Retrofit Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h5 className="font-semibold mb-1">{retrofit.title}</h5>
                                                <p className="text-sm text-muted-foreground">
                                                    {retrofit.shortDescription}
                                                </p>
                                                {/* Expandable Long Description */}
                                                {isExpanded(option.id, index) && (
                                                    <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                                                        {retrofit.longDescription}
                                                    </div>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2 h-auto p-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                                    onClick={() => toggleExpanded(option.id, index)}
                                                >
                                                    {isExpanded(option.id, index) ? (
                                                        <>
                                                            <ChevronUp className="w-3 h-3 mr-1" />
                                                            See Less
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-3 h-3 mr-1" />
                                                            See More
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Contractors for this retrofit */}
                                        <div className="pt-3 border-t">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wrench className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium">
                                                    Local Contractors:
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {retrofit.contractors.map((contractor, cIndex) => (
                                                    <div
                                                        key={cIndex}
                                                        className="bg-gray-50 rounded p-3 text-sm"
                                                    >
                                                        <div className="font-medium mb-1">
                                                            {contractor.name}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{contractor.number}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span>{contractor.address}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <a
                                                                    href={
                                                                        contractor.website.startsWith("http")
                                                                            ? contractor.website
                                                                            : `https://${contractor.website}`
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-gray-500 hover:text-gray-800 hover:underline transition-colors"
                                                                >
                                                                    {contractor.website}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Add this block below */}
                                            <div className="mt-3 pt-2 border-t border-gray-200">
                                                <a
                                                    href="https://www.efficiencyvermont.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                    See More Contractors
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
