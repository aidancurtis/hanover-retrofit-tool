import { RouterProvider } from "react-router";
import { useEffect, useState } from "react";
import { router } from "./routes";

function App() {
    return <RouterProvider router={router} />;
}

export default App;
