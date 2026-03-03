import { Outlet } from "react-router";
import { Leaf } from "lucide-react";
import { UserDetailsProvider } from "../context/UserDetailsContext";

export function Root() {
    return (
        <UserDetailsProvider>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Leaf className="w-10 h-10 text-green-600" />
                            <h1 className="text-green-900">
                                Hanover Home Retrofit Calculator
                            </h1>
                        </div>
                    </div>

                    {/* Page Content */}
                    <Outlet />

                    {/* Footer */}
                    <div className="mt-12 text-center text-sm text-muted-foreground">
                        <p>
                            This tool is designed for informational purposes. Please consult
                            with certified energy auditors and contractors for detailed
                            assessments and professional installation.
                        </p>
                    </div>
                </div>
            </div>
        </UserDetailsProvider>
    );
}
