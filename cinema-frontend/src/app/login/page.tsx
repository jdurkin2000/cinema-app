"use client";
import { FormEvent, useState } from "react";
import { login } from "@/libs/authApi";
import { saveToken } from "@/libs/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const data = await login({ email, password, rememberMe: remember });
      saveToken(data.token, remember);
      window.dispatchEvent(new Event("token-changed"));
      router.push(data.role === "ADMIN" ? "/system-admin" : "/");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Sign in</h1>
      {verified && <p className="login-msg">Email verified. You can sign in now.</p>}
      <form onSubmit={onSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <button type="submit" className="login-button">Login</button>
      </form>
      {err && <p className="login-err">{err}</p>}
      <div className="login-footer">
        <Link href="/forgot-password">Forgot password?</Link> |{" "}
        <Link href="/register">Sign up</Link>
      </div>
    </div>
  );
}
