const AUTH_TOKEN_KEY = "playeriq.token";

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}

export function setStoredToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    clearStoredToken();
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export { AUTH_TOKEN_KEY };
