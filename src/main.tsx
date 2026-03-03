import { createRoot } from "react-dom/client";
import { DatasetProvider } from "./context/DatasetContext";
import App from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
    <DatasetProvider>
        <App />
    </DatasetProvider>,
);
