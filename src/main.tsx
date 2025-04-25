import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LostPage from "./pages/LostPage";
import FoundPage from "./pages/FoundPage";
import FOUNDITEMSPAGE from "./pages/FoundItemsPage";
import LOSTITEMS from "./pages/LostItemsPage";
import AdminSignIn from "./LoginPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./index.css";
const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/lostitem" element={<LostPage />} />
          <Route path="/founditem" element={<FoundPage />} />
          <Route path="/founditems" element={<FOUNDITEMSPAGE />} />
          <Route path="/signin" element={<AdminSignIn />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/lostitems" element={<LOSTITEMS />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  console.error("Root element not found");
}
