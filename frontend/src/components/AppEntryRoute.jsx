import { Navigate } from "react-router-dom";

import AppStatusScreen from "./AppStatusScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppEntryRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <AppStatusScreen
        eyebrow="Workspace Boot"
        title="Preparing your PlayerIQ workspace"
        message="Restoring session state and routing you into the correct analyst flow."
      />
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
