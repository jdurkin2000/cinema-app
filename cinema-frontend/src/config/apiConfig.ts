/**
 * Centralized API configuration
 *
 * Automatically uses the current hostname when accessed from network,
 * or falls back to localhost for development.
 *
 * To override, set NEXT_PUBLIC_API_HOST environment variable.
 */

// Get the current hostname dynamically (works for any network IP)
const getApiHost = (): string => {
  // Server-side: use env var or localhost
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_HOST || "localhost";
  }

  // Client-side: use current hostname (auto-detects network IP)
  const hostname = window.location.hostname;

  // If accessed via network IP, use that IP for backend
  // If accessed via localhost, use localhost
  return hostname;
};

// Backend API host (auto-detected from current URL)
const API_HOST = getApiHost();
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8080";

// Construct base URLs
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;
export const API_URL = `${API_BASE_URL}/api`;

// Specific API endpoints
export const AUTH_API_BASE = API_BASE_URL;
export const MOVIES_API = `${API_URL}/movies`;
export const SHOWROOMS_API = `${API_URL}/showrooms`;
export const PROMOTIONS_API = `${API_URL}/promotions`;
export const BOOKINGS_API = `${API_URL}/bookings`;

// Helper to check if running on local network
export const isLocalNetwork = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "";
};
