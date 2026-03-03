import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Home, Leaf, TrendingDown } from "lucide-react";

export function IntroPage() {
    const navigate = useNavigate();

    return (
        <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <Home className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl">Hanover Home Energy Retrofit Calculator</h1>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                    Get personalized energy-saving recommendations with local contractor
                    information
                </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <span>Lower Bills</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span>Reduce Emissions</span>
                </div>
            </div>

            <Button
                onClick={() => navigate("/questionnaire")}
                size="lg"
                className="bg-green-600 hover:cursor-pointer hover:bg-green-700 text-lg px-8 py-6"
            >
                Get Started
            </Button>

            <p className="text-sm text-muted-foreground">
                Takes 2 minutes • Get two tailored scenarios with local contractor info
            </p>
        </div>
    );
}
