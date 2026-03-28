import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import ComparisonPage from "./pages/ComparisonPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MatchAnalysisPage from "./pages/MatchAnalysisPage.jsx";
import PlayerProfilePage from "./pages/PlayerProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="player/:id" element={<PlayerProfilePage />} />
        <Route path="compare" element={<ComparisonPage />} />
        <Route path="matches/:id" element={<MatchAnalysisPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

