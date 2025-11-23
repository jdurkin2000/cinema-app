"use client";
import { FormEvent, useState } from "react";
import { login } from "@/libs/authApi";
import { saveToken } from "@/libs/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

      // Save the token in localStorage
      saveToken(data.token, remember);

      // Notify NavBar and other listeners that token changed
      window.dispatchEvent(new Event("token-changed"));

      // redirect by role
      router.push(data.role === "ADMIN" ? "/system-admin" : "/");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {verified && <p className="text-green-600 mb-3">Email verified. You can sign in now.</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <button className="bg-black text-white px-4 py-2 rounded">Login</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
      <div className="mt-4 text-sm flex justify-between">
        <Link className="underline" href="/forgot-password">Forgot password?</Link>
        <Link className="underline" href="/register">Sign up</Link>
      </div>
    </div>
  );
}
