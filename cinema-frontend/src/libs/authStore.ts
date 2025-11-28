const authTokenIdentifier = "authToken";

export function saveToken(token: string, remember: boolean) {
  if (remember) localStorage.setItem(authTokenIdentifier, token);
  sessionStorage.setItem(authTokenIdentifier, token);
  // Set cookie. For local development (localhost or 127.*) avoid Secure flag so the
  // cookie is sent over plain HTTP. In production (HTTPS) keep Secure for safety.
  try {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocal = host === "localhost" || host === "127.0.0.1" || host === "";
    const securePart = isLocal ? "" : "; Secure";
    document.cookie = `${authTokenIdentifier}=${encodeURIComponent(
      token
    )}; path=/${securePart}; SameSite=Lax`;
  } catch (e) {
    // ignore cookie failures in non-browser environments
  }
}
export function getToken(): string | null {
  return (
    sessionStorage.getItem(authTokenIdentifier) ||
    localStorage.getItem(authTokenIdentifier)
  );
}
export function clearToken() {
  sessionStorage.removeItem(authTokenIdentifier);
  localStorage.removeItem(authTokenIdentifier);
  // Remove cookie (cover both with and without Secure)
  try {
    document.cookie = `${authTokenIdentifier}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    document.cookie = `${authTokenIdentifier}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`;
  } catch (e) {
    // ignore
  }
}
