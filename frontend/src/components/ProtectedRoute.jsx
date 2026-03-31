import { Navigate, Outlet, useLocation } from "react-router-dom";

import AppStatusScreen from "./AppStatusScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <AppStatusScreen
        eyebrow="Secure Workspace"
        title="Restoring your PlayerIQ session"
        message="Loading authentication, workspace guards, and analyst context."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
