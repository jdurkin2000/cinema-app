"use client";

import "./Navbar.css"; // <--- just for NavBar
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.svg";
import { useAuth } from "@/app/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="topnav">
      <Link href="/" className="nav-brand" style={{ display: "flex", alignItems: "center" }}>
        <Image src={logo} alt="Site Logo" className="nav-logo" />
        <h1 className="title">PeakCinema</h1>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-welcome">Welcome, {user}</span>
            <Link href="/">Home</Link>
            <Link href="/profile">Edit Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
          <Link href="/register" className="register-button">Register</Link>
          <Link href="/login" className="login-button">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
