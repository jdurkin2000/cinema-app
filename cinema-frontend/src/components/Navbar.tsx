"use client";

import "./Navbar.css"; // <--- just for NavBar
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { useAuth } from "@/app/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="topnav">
      <Image src={logo} alt="Site Logo" className="nav-logo" />
      <h1 className="title">CINEMA</h1>

      <div className="nav-links">
        {user ? (
          <>
            <Link href="/profile" className="text-white font-semibold">
              Welcome, {user}
            </Link>
            <Link href="/profile">Edit Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
