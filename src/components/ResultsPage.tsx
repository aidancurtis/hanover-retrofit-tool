import { useNavigate } from "react-router";
import { useUserDetails } from "../context/UserDetailsContext.tsx";
import { RetrofitResults } from "./RetrofitResults";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function ResultsPage() {
    const navigate = useNavigate();
    const { retrofitOptions } = useUserDetails();

    return (
        <div>
            <div className="mb-6">
                <Button onClick={() => navigate("/")} variant="outline">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Start Over
                </Button>
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
