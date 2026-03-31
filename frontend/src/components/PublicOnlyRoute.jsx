import { Navigate, Outlet } from "react-router-dom";

import AppStatusScreen from "./AppStatusScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <AppStatusScreen
        eyebrow="Authentication"
        title="Preparing secure access"
        message="Checking for an active PlayerIQ session before loading the sign-in experience."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
