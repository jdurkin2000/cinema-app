"use client";
import { FormEvent, useState } from "react";
import { register as apiRegister } from "@/libs/authApi";
import Link from "next/link";

export default function RegisterPage(){
  const [form, setForm] = useState({ name:"", email:"", password:"", promotionsOptIn:false });
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  async function onSubmit(e:FormEvent){
    e.preventDefault(); setErr(null); setMsg(null);
    try{
      await apiRegister(form);
      setMsg("Success! Check your email to confirm your account.");
    }catch(e:any){ setErr(e?.response?.data?.message || "Registration failed"); }
  }
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Full name" required
          value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="border p-2 w-full" placeholder="Email" type="email" required
          value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input className="border p-2 w-full" placeholder="Password (min 8)" type="password" minLength={8} required
          value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.promotionsOptIn} onChange={e=>setForm({...form,promotionsOptIn:e.target.checked})}/>
          <span>Sign me up for promotions</span>
        </label>
        <button className="bg-black text-white px-4 py-2 rounded">Register</button>
      </form>
      {msg && <p className="text-green-600 mt-3">{msg}</p>}
      {err && <p className="text-red-600 mt-3">{err}</p>}
      <p className="mt-4 text-sm">Already have an account? <Link className="underline" href="/login">Sign in</Link></p>
    </div>
  );
}
