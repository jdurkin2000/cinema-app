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
  const [suspendModal, setSuspendModal] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

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
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || "Login failed";
      if (status === 403 && /suspended/i.test(msg)) {
        setSuspendModal({
          show: true,
          message: "Your account has been suspended.",
        });
        setErr(null);
      } else {
        setErr(msg);
      }
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-header">Sign in</h1>

      {verified && (
        <p className="login-msg">Email verified. You can sign in now.</p>
      )}

      <form onSubmit={onSubmit} className="login-form">
        <div className="input-with-asterisk">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="required-asterisk">*</span>
        </div>

        <div className="input-with-asterisk">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="required-asterisk">*</span>
        </div>

        <label>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>Remember me</span>
        </label>

        <button type="submit" className="login-button">
          Login
        </button>
      </form>

      {err && <p className="login-err">{err}</p>}

      {suspendModal.show && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSuspendModal({ show: false, message: "" })}
          />
          <div className="relative bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Account Suspended</h2>
            <p className="mb-4">{suspendModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={() => setSuspendModal({ show: false, message: "" })}
              >
                Close
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                onClick={() => router.push("/")}
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="login-footer">
        <Link href="/forgot-password">Forgot password?</Link> |{" "}
        <Link href="/register">Sign up</Link>
      </div>
    </div>
  );
}
