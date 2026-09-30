const ACCESS_TOKEN_KEY = "summuss.accessToken";
const REFRESH_TOKEN_KEY = "summuss.refreshToken";

export const AUTH_LOGOUT_EVENT = "summuss:auth-logout";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasTokens() {
  return Boolean(getAccessToken());
}

export function emitAuthLogout() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}
