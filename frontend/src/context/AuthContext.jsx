import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { ApiError, getCurrentUser, loginUser, registerUser } from "../api/client.js";
import { clearStoredToken, getStoredToken, setStoredToken } from "../auth/session.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorMeta, setErrorMeta] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!token) {
        if (isMounted) {
          setIsReady(true);
        }
        return;
      }

      setIsLoading(true);

      try {
        const response = await getCurrentUser();
        if (!isMounted) {
          return;
        }
        setUser(response.user);
        setError("");
        setErrorMeta(null);
      } catch (_error) {
        if (!isMounted) {
          return;
        }
        clearStoredToken();
        setToken(null);
        setUser(null);
        setError("");
        setErrorMeta(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const applyAuthResponse = (payload) => {
    setStoredToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
    setError("");
    setErrorMeta(null);
  };

  const applyAuthError = (authError, fallbackMessage) => {
    const message = authError instanceof Error ? authError.message : fallbackMessage;
    setError(message);
    setErrorMeta({
      statusCode: authError instanceof ApiError ? authError.statusCode : null,
      requestId: authError instanceof ApiError ? authError.requestId : null,
    });
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError("");
    setErrorMeta(null);

    try {
      const payload = await loginUser(credentials);
      applyAuthResponse(payload);
      return payload;
    } catch (authError) {
      applyAuthError(authError, "Login failed");
      throw authError;
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  };

  const register = async (details) => {
    setIsLoading(true);
    setError("");
    setErrorMeta(null);

    try {
      const payload = await registerUser(details);
      applyAuthResponse(payload);
      return payload;
    } catch (authError) {
      applyAuthError(authError, "Registration failed");
      throw authError;
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setError("");
    setErrorMeta(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isReady,
      isLoading,
      error,
      errorMeta,
      setError,
      login,
      register,
      logout,
      clearError: () => {
        setError("");
        setErrorMeta(null);
      },
    }),
    [token, user, isReady, isLoading, error, errorMeta],
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
