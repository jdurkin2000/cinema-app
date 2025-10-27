"use client";
import { useEffect, useState } from "react";
import { addCard, changePassword, me, removeCard, updateProfile } from "@/libs/authApi";
import { clearToken, getToken } from "@/libs/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Added this import

export default function Profile() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { const t = getToken(); if (!t) { router.push("/login"); return; } setToken(t); load(t); }, []);
  async function load(t: string) { try { setData(await me(t)); } catch { router.push("/login"); } }

  async function saveProfile(e: any) {
    e.preventDefault(); setMsg(null); setErr(null);
    try {
      await updateProfile(token!, {
        firstLastName: e.target.name.value,
        promotionsOptIn: e.target.promos.checked,
        address: {
          line1: e.target.line1.value, line2: e.target.line2.value,
          city: e.target.city.value, state: e.target.state.value, zip: e.target.zip.value
        }
      });
      setMsg("Saved"); await load(token!);
    } catch (x: any) { setErr(x?.response?.data?.message || "Update failed"); }
  }

  async function changePwd(e: any) {
    e.preventDefault(); setMsg(null); setErr(null);
    try {
      await changePassword(token!, e.target.current.value, e.target.new.value);
      setMsg("Password changed");
    } catch (x: any) { setErr(x?.response?.data?.message || "Change password failed"); }
  }

  async function addCardSubmit(e: any) {
    e.preventDefault(); setMsg(null); setErr(null);
    try {
      await addCard(token!, {
        number: e.target.number.value,
        expMonth: Number(e.target.month.value),
        expYear: Number(e.target.year.value),
        billingName: e.target.billingName.value,
        billingAddress: {
          line1: e.target.bline1.value, line2: e.target.bline2.value,
          city: e.target.bcity.value, state: e.target.bstate.value, zip: e.target.bzip.value
        }
      });
      setMsg("Card added"); await load(token!);
    } catch (x: any) { setErr(x?.response?.data?.message || "Add card failed"); }
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Profile</h1>

        {/* --- Wrapper for buttons on the right --- */}
        <div className="flex items-center gap-4">
          {/* --- NEW Homepage Link Button --- */}
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Back to Home
          </Link>

          {/* --- Existing Logout Button --- */}
          <button className="text-red-600 underline"
            onClick={() => { clearToken(); router.push("/"); }}>Logout</button>
        </div>
      </div>

      {msg && <div className="text-green-600">{msg}</div>}
      {err && <div className="text-red-600">{err}</div>}

      <form onSubmit={saveProfile} className="space-y-2 border p-4 rounded">
        <div className="font-medium">Profile</div>
        <input name="name" className="border p-2 w-full" defaultValue={data.name} required />
        <input className="border p-2 w-full" value={data.email} disabled />
        <label className="flex items-center gap-2 mt-2">
          <input name="promos" type="checkbox" defaultChecked={data.promotionsOptIn} />
          <span>Receive promotions</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input name="line1" className="border p-2" placeholder="Address line 1" defaultValue={data.address?.line1 || ""} />
          <input name="line2" className="border p-2" placeholder="Address line 2" defaultValue={data.address?.line2 || ""} />
          <input name="city" className="border p-2" placeholder="City" defaultValue={data.address?.city || ""} />
          <input name="state" className="border p-2" placeholder="State" defaultValue={data.address?.state || ""} />
          <input name="zip" className="border p-2" placeholder="ZIP" defaultValue={data.address?.zip || ""} />
        </div>
        <button className="bg-black text-white px-4 py-2 rounded mt-2">Save</button>
      </form>

      <form onSubmit={changePwd} className="space-y-2 border p-4 rounded">
        <div className="font-medium">Change password</div>
        <input name="current" className="border p-2 w-full" type="password" placeholder="Current password" required />
        <input name="new" className="border p-2 w-full" type="password" minLength={8} placeholder="New password" required />
        <button className="bg-black text-white px-4 py-2 rounded">Change</button>
      </form>

      <div className="space-y-2 border p-4 rounded">
        <div className="font-medium">Payment cards (max 4)</div>
        <ul className="space-y-1">
          {data.paymentCards.map((c: any) => (
            <li key={c.id} className="flex justify-between items-center">
              <span>{c.brand} •••• {c.last4}  (exp {c.expMonth}/{c.expYear})</span>
              <button className="text-sm text-red-600 underline" onClick={async () => {
                await removeCard(token!, c.id); await load(token!);
              }}>Remove</button>
            </li>
          ))}
        </ul>
        {data.paymentCards.length < 4 && (
          <form onSubmit={addCardSubmit} className="grid grid-cols-2 gap-2 mt-2">
            <input name="number" className="border p-2 col-span-2" placeholder="Card number" required />
            <input name="month" className="border p-2" placeholder="MM" type="number" min={1} max={12} required />
            <input name="year" className="border p-2" placeholder="YYYY" type="number" min={2024} max={2100} required />
            <input name="billingName" className="border p-2 col-span-2" placeholder="Billing name" required />
            <input name="bline1" className="border p-2 col-span-2" placeholder="Billing address line 1" required />
            <input name="bline2" className="border p-2 col-span-2" placeholder="Billing address line 2" />
            <input name="bcity" className="border p-2" placeholder="City" required />
            <input name="bstate" className="border p-2" placeholder="State" required />
            <input name="bzip" className="border p-2" placeholder="ZIP" required />
            <button className="bg-black text-white px-4 py-2 rounded col-span-2">Add card</button>
          </form>
        )}
      </div>
    </div>
  );
}

