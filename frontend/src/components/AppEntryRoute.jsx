import { Navigate } from "react-router-dom";

import AppStatusScreen from "./AppStatusScreen.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppEntryRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <AppStatusScreen
        eyebrow="PlayerIQ"
        title="Opening PlayerIQ"
        message="Preparing your football home."
      />
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
