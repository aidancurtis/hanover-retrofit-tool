import { useNavigate } from "react-router";
import { useUserDetails } from "../context/UserDetailsContext.tsx";
import { RetrofitResults } from "./RetrofitResults";
import { Button } from "./ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { generateRetrofitPDF } from "./PDFExport";
import { UserDetails } from "../types.tsx";

export function ResultsPage() {
    const navigate = useNavigate();
    const { retrofitOptions, details } = useUserDetails();

    const handleExportPDF = () => {
        const normalizedDetails: UserDetails = {
            houseDetails: details.houseDetails ?? null,
            preferences: details.preferences ?? null,
        };
        generateRetrofitPDF(normalizedDetails, retrofitOptions);
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <Button onClick={() => navigate("/")} variant="outline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Start Over
                </Button>

                {retrofitOptions.length > 0 && (
                    <Button onClick={handleExportPDF}>
                        <Download className="mr-2 w-4 h-4" />
                        Export to PDF
                    </Button>
                )}
            </div>

            {retrofitOptions.length > 0 ? (
                <RetrofitResults options={retrofitOptions} />
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No results available. Please complete the questionnaire first.</p>
                </div>
            )}
        </div>
    );
}
