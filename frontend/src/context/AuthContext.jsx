import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  clearSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "../auth/session.js";

const AuthContext = createContext(null);

const buildDemoAuthResponse = (name, email) => ({
  token: `demo-${Date.now()}`,
  user: {
    name: name?.trim() || "Football Fan",
    email: email?.trim() || "fan@playeriq.demo",
  },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsReady(true);
  }, []);

  const login = async ({ email, password }) => {
    const response = buildDemoAuthResponse(email?.split("@")[0] || "Football Fan", email);
    setStoredToken(response.token);
    setStoredUser(response.user);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const register = async ({ name, email, password }) => {
    const response = buildDemoAuthResponse(name, email);
    setStoredToken(response.token);
    setStoredUser(response.user);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
