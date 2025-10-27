"use client";
import { useState } from "react";
import { forgot } from "@/libs/authApi";

export default function Forgot(){
  const [email,setEmail]=useState(""); const [msg,setMsg]=useState<string|null>(null);
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Forgot password</h1>
      <form onSubmit={async e=>{ e.preventDefault(); await forgot(email); setMsg("If the email exists, we'll send a reset link."); }}>
        <input className="border p-2 w-full" type="email" required placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <button className="bg-black text-white px-4 py-2 rounded mt-3">Send reset link</button>
      </form>
      {msg && <p className="text-green-600 mt-3">{msg}</p>}
    </div>
  );
}
