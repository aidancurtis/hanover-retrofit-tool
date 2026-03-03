import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { router } from "./routes";

function App() {
    useEffect(() => {
        document.title = "Hanover Retrofit Tool";
    }, []);

    return <RouterProvider router={router} />;
}

export default App;
