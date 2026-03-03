import { useState } from "react";
import { useNavigate } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useUserDetails } from "../context/UserDetailsContext";

import { UserPreferences, HouseDetails } from "../types";

export function HouseQuestionnaire() {
    const navigate = useNavigate();
    const { details, updateDetails, calculateRetrofitOptions } = useUserDetails();

    const [errors, setErrors] = useState<{
        squareFootage?: string;
        yearBuilt?: string;
        annualEnergyConsumption?: string;
        annualElectricityConsumption?: string;
        annualUtilityBill?: string;
    }>({});

    const comfortQuestions = [
        {
            id: "energyConsumption" as keyof UserPreferences,
            label: "Energy Consumption",
            description: "How much of a priority is lowering energy consumption?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "emissions" as keyof UserPreferences,
            label: "Emissions",
            description: "How much of a priority is reducing emissions?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "operatingCost" as keyof UserPreferences,
            label: "Operating Costs",
            description: "How much of a priority are operating costs?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "upfrontCost" as keyof UserPreferences,
            label: "Upfront Costs",
            description: "How much of a priority is the upfront cost?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "paybackPeriod" as keyof UserPreferences,
            label: "Payback Period",
            description: "How much of a priority is the payback period?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "comfort" as keyof UserPreferences,
            label: "Comfort",
            description:
                "How much of a priority is improving the comfort of your home?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "timeline" as keyof UserPreferences,
            label: "Time",
            description: "How much of a priority is limiting the retrofit time?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
        {
            id: "invasiveness" as keyof UserPreferences,
            label: "Invasiveness",
            description:
                "How much of a priority is limiting the retrofit invasiveness?",
            lowLabel: "Not a priority",
            highLabel: "Strong priority",
        },
    ];

    const handlePreferenceChange = (
        questionId: keyof UserPreferences,
        value: number,
    ) => {
        updateDetails({
            preferences: {
                energyConsumption: 0,
                emissions: 0,
                operatingCost: 0,
                upfrontCost: 0,
                paybackPeriod: 0,
                comfort: 0,
                timeline: 0,
                invasiveness: 0,
                ...details.preferences,
                [questionId]: value,
            } as UserPreferences,
        });
    };

    const handleHouseDetailsChange = (
        questionId: keyof HouseDetails,
        value: number,
    ) => {
        updateDetails({
            houseDetails: {
                squareFootage: 0,
                yearBuilt: 0,
                annualEnergyConsumption: 0,
                annualElectricityConsumption: 0,
                annualUtilityBill: 0,
                ...details.houseDetails,
                [questionId]: value,
            } as HouseDetails,
        });
    };

    const handleSubmit = () => {
        const newErrors: {
            squareFootage?: string;
            yearBuilt?: string;
            annualEnergyConsumption?: string;
            annualElectricityConsumption?: string;
            annualUtilityBill?: string;
        } = {};

        if (
            !details.houseDetails?.squareFootage ||
            details.houseDetails.squareFootage <= 0
        ) {
            newErrors.squareFootage = "Please enter a valid square footage";
        }

        if (
            !details.houseDetails?.annualEnergyConsumption ||
            details.houseDetails.annualEnergyConsumption <= 0
        ) {
            newErrors.annualEnergyConsumption =
                "Please enter a valid annual energy consumption";
        }

        if (
            !details.houseDetails?.annualElectricityConsumption ||
            details.houseDetails.annualElectricityConsumption <= 0
        ) {
            newErrors.annualElectricityConsumption =
                "Please enter a valid annual electricity consumption";
        }

        if (
            !details.houseDetails?.annualUtilityBill ||
            details.houseDetails.annualUtilityBill <= 0
        ) {
            newErrors.annualUtilityBill = "Please enter a valid annual utility bill";
        }

        if (
            !details.houseDetails?.yearBuilt ||
            (details.houseDetails.yearBuilt &&
                details.houseDetails.yearBuilt < 1800) ||
            details.houseDetails.yearBuilt > new Date().getFullYear()
        ) {
            newErrors.yearBuilt = "Please enter a valid year";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        updateDetails({
            houseDetails: details.houseDetails,
            preferences: details.preferences,
        });

        calculateRetrofitOptions();
        navigate("/results");
    };

    const handleBack = () => {
        navigate("/");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Home className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle>Home Energy Assessment</CardTitle>
                <CardDescription>
                    Answer the questions below to receive personalized retrofit
                    recommendations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">
                        Home Information
                    </h3>

                    <div className="space-y-2">
                        <Label htmlFor="squareFootage">
                            Square Footage <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="squareFootage"
                            type="number"
                            placeholder="e.g., 2000"
                            value={details.houseDetails?.squareFootage || ""}
                            onChange={(e) => {
                                handleHouseDetailsChange(
                                    "squareFootage",
                                    parseInt(e.target.value),
                                );
                                setErrors((prev) => ({ ...prev, squareFootage: undefined }));
                            }}
                            className={errors.squareFootage ? "border-red-500" : ""}
                            min="0"
                        />
                        {errors.squareFootage && (
                            <p className="text-sm text-red-500">{errors.squareFootage}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Total finished living space in your home
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="yearBuilt">Year Built</Label>
                        <Input
                            id="yearBuilt"
                            type="number"
                            placeholder="e.g., 1985"
                            value={details.houseDetails?.yearBuilt || ""}
                            onChange={(e) => {
                                handleHouseDetailsChange("yearBuilt", parseInt(e.target.value));
                                setErrors((prev) => ({ ...prev, yearBuilt: undefined }));
                            }}
                            className={errors.yearBuilt ? "border-red-500" : ""}
                            min="1800"
                            max={new Date().getFullYear()}
                        />
                        {errors.yearBuilt && (
                            <p className="text-sm text-red-500">{errors.yearBuilt}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Helps us estimate insulation and energy efficiency needs
                        </p>
                    </div>

                    {/* Energy Consumption */}
                    <div className="space-y-2">
                        <Label htmlFor="annualEnergyConsumption">
                            Annual Energy Consumption (kWh)
                        </Label>
                        <Input
                            id="annualEnergyConsumption"
                            type="number"
                            // placeholder="1500"
                            value={details.houseDetails?.annualEnergyConsumption || ""}
                            onChange={(e) => {
                                handleHouseDetailsChange(
                                    "annualEnergyConsumption",
                                    parseInt(e.target.value),
                                );
                                setErrors((prev) => ({ ...prev, yearBuilt: undefined }));
                            }}
                            className={errors.annualEnergyConsumption ? "border-red-500" : ""}
                        />
                        {errors.annualEnergyConsumption && (
                            <p className="text-sm text-red-500">
                                {errors.annualEnergyConsumption}
                            </p>
                        )}
                    </div>

                    {/* Electricity Consumption */}
                    <div className="space-y-2">
                        <Label htmlFor="annualElectricityConsumption">
                            Annual Electricity Consumption (kWh)
                        </Label>
                        <Input
                            id="annualElectricityConsumption"
                            type="number"
                            // placeholder="e.g., 1985"
                            value={details.houseDetails?.annualElectricityConsumption || ""}
                            onChange={(e) => {
                                handleHouseDetailsChange(
                                    "annualElectricityConsumption",
                                    parseInt(e.target.value),
                                );
                                setErrors((prev) => ({ ...prev, yearBuilt: undefined }));
                            }}
                            className={
                                errors.annualElectricityConsumption ? "border-red-500" : ""
                            }
                        />
                        {errors.annualElectricityConsumption && (
                            <p className="text-sm text-red-500">
                                {errors.annualElectricityConsumption}
                            </p>
                        )}
                    </div>

                    {/* Utility Bill */}
                    <div className="space-y-2">
                        <Label htmlFor="annualUtilityBill">Annual Utility Bill ($)</Label>
                        <Input
                            id="annualUtilityBill"
                            type="number"
                            // placeholder="e.g., 1985"
                            value={details.houseDetails?.annualUtilityBill || ""}
                            onChange={(e) => {
                                handleHouseDetailsChange(
                                    "annualUtilityBill",
                                    parseInt(e.target.value),
                                );
                                setErrors((prev) => ({ ...prev, yearBuilt: undefined }));
                            }}
                            className={errors.annualUtilityBill ? "border-red-500" : ""}
                        />
                        {errors.annualUtilityBill && (
                            <p className="text-sm text-red-500">{errors.annualUtilityBill}</p>
                        )}
                    </div>
                </div>

                {/* User Preferences Section */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">
                        Retrofit Preferences
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Rate your retrofit preference levels
                    </p>

                    {comfortQuestions.map((question) => (
                        <div key={question.id} className="space-y-3">
                            <div>
                                <Label className="text-base">{question.label}</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {question.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handlePreferenceChange(question.id, value)}
                                            className={`flex-1 h-14 rounded-lg border-2 transition-all hover:cursor-pointer hover:border-green-400 ${details.preferences?.[question.id] === value
                                                    ? "border-green-600 bg-green-50 shadow-sm"
                                                    : "border-gray-200 bg-white"
                                                }`}
                                        >
                                            <div className="font-semibold text-lg">{value}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>{question.lowLabel}</span>
                                    <span>{question.highLabel}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                    <Button onClick={handleBack} variant="outline" size="lg">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        See Results
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
