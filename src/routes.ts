import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { IntroPage } from "./components/IntroPage";
import { HouseQuestionnaire } from "./components/HouseQuestionnaire";
import { ResultsPage } from "./components/ResultsPage";
import { Navigate } from "react-router";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            { index: true, Component: IntroPage },
            { path: "questionnaire", Component: HouseQuestionnaire },
            { path: "results", Component: ResultsPage },
            // { path: "*", element: <Navigate to="/" replace /> },
        ],
    },
]);
