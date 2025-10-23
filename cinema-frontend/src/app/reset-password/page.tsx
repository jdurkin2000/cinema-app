"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/libs/authApi";

export default function Reset(){
  const token = useSearchParams().get("token") || "";
  const [pwd,setPwd]=useState(""); const [err,setErr]=useState<string|null>(null);
  const router = useRouter();

  async function submit(e:any){
    e.preventDefault(); setErr(null);
    try{ await resetPassword(token, pwd); router.push("/login"); }
    catch(e:any){ setErr(e?.response?.data?.message || "Reset failed"); }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" type="password" minLength={8} required placeholder="New password"
               value={pwd} onChange={e=>setPwd(e.target.value)}/>
        <button className="bg-black text-white px-4 py-2 rounded">Update</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
    </div>
  );
}
