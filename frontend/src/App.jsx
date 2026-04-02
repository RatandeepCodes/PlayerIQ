import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppEntryRoute from "./components/AppEntryRoute.jsx";
import AppStatusScreen from "./components/AppStatusScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";

const Layout = lazy(() => import("./components/Layout.jsx"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const MatchAnalysisPage = lazy(() => import("./pages/MatchAnalysisPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));

const routeFallback = (
  <AppStatusScreen
    eyebrow="PlayerIQ"
    title="Loading the next screen"
    message="Preparing the next football view and connecting the page to the live workspace."
  />
);

export default function App() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<AppEntryRoute />} />

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
    </Suspense>
  );
}
