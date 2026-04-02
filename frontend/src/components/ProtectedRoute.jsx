import { Navigate, Outlet, useLocation } from "react-router-dom";

import AppStatusScreen from "./AppStatusScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <AppStatusScreen
        eyebrow="PlayerIQ"
        title="Getting your football space ready"
        message="Loading your session and preparing the app."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
