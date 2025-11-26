"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getToken, clearToken } from "@/libs/authStore";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: string | null;
  setUser: (name: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const syncFromToken = () => {
      const token = getToken();
      if (token) {
        const decoded = decodeJwt(token);
        setUser(decoded?.name || decoded?.sub || null);
      } else {
        setUser(null);
      }
    };

    // initial
    syncFromToken();
    // react to token updates (login/logout)
    window.addEventListener("token-changed", syncFromToken);
    return () => window.removeEventListener("token-changed", syncFromToken);
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    // notify listeners like Navbar to refresh derived state (e.g., role)
    window.dispatchEvent(new Event("token-changed"));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
