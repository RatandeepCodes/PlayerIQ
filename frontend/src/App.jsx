import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import ComparisonPage from "./pages/ComparisonPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MatchAnalysisPage from "./pages/MatchAnalysisPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PlayerProfilePage from "./pages/PlayerProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { isAuthenticated } from "./auth/session.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="player/:id" element={<PlayerProfilePage />} />
          <Route path="compare" element={<ComparisonPage />} />
          <Route path="matches/:id" element={<MatchAnalysisPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
