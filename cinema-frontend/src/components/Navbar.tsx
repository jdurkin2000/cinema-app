"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import { getToken, clearToken } from "@/libs/authStore";
import { useRouter } from "next/navigation";
import "./Navbar.css";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  // Update username from token
  const updateUser = () => {
    const token = getToken();
    if (token) {
      const decoded = decodeJwt(token);
      setUsername(decoded?.name || decoded?.sub || null);
      setRole(decoded?.role || null);
    } else {
      setUsername(null);
      setRole(null);
    }
  };

  useEffect(() => {
    updateUser(); // initial check
    window.addEventListener("token-changed", updateUser); // listen for token updates
    return () => window.removeEventListener("token-changed", updateUser);
  }, []);

  const handleLogout = () => {
    clearToken();
    setUsername(null);
    window.dispatchEvent(new Event("token-changed")); // notify others
    router.push("/");
  };

  return (
    <nav className="topnav">
      <Link href="/" className="nav-brand" style={{ display: "flex", alignItems: "center" }}>
        <Image src={logo} alt="Site Logo" className="nav-logo" />
        <h1 className="title">PeakCinema</h1>
      </Link>

      <div className="nav-links">
        {username ? (
          <>
            {role === "ADMIN" ? (
              <Link href="/system-admin" className="nav-welcome admin-home-button">Admin Homepage</Link>
            ) : (
              <>
                <span className="nav-welcome">Welcome, {username}</span>
                <Link href="/profile">Edit Profile</Link>
              </>
            )}
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/register" className="register-button">Register</Link>
            <Link href="/login" className="signin-button">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
}
