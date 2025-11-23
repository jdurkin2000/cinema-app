"use client";


import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";
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

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUsername(decoded.name || decoded.sub);
      }
    }
  }, []);

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    clearToken();
    setUsername(null);
    window.location.reload();
  };

  return (
    <nav className="topnav">
      <Image src={logo} alt="Site Logo" className="nav-logo" />
      <h1 className="title">CINEMA</h1>

      <div className="nav-links">
        {username ? (
          <>
            <Link href="/profile" className="text-white font-semibold">
              Welcome, {username}
            </Link>
            <Link href="/profile">Edit Profile</Link>
            <a href="#" onClick={handleLogout}>Logout</a>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
