import { Navigate, Outlet } from "react-router-dom";

import AppStatusScreen from "./AppStatusScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <AppStatusScreen
        eyebrow="PlayerIQ"
        title="Checking your session"
        message="Loading the right screen for you."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
