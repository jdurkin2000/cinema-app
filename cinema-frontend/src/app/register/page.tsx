"use client";
import { FormEvent, useState } from "react";
import { register as apiRegister } from "@/libs/authApi";
import Link from "next/link";
import "./register.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    promotionsOptIn: false,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      await apiRegister(form);
      setMsg("Success! Check your email to confirm your account.");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="register-container">
      <h1 className="register-header">Create your account</h1>
      <form onSubmit={onSubmit} className="register-form">

        <div className="input-with-asterisk">
          <input
            type="text"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <span className="required-asterisk">*</span>
        </div>

        <div className="input-with-asterisk">
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <span className="required-asterisk">*</span>
        </div>

        <div className="input-with-asterisk">
          <input
            type="password"
            placeholder="Password (min 8)"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <span className="required-asterisk">*</span>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.promotionsOptIn}
            onChange={(e) =>
              setForm({ ...form, promotionsOptIn: e.target.checked })
            }
          />
          <span>Sign me up for promotions</span>
        </label>

        <button type="submit" className="register-button">
          Register
        </button>
      </form>

      {msg && <p className="register-msg">{msg}</p>}
      {err && <p className="register-err">{err}</p>}

      <p className="register-footer">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
