"use client";
import { useEffect, useState, FormEvent } from "react";
import { addCard, changePassword, me, removeCard, updateCard, updateProfile } from "@/libs/authApi";
import { clearToken, getToken } from "@/libs/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    setToken(t);
    load(t);
  }, []);

  async function load(t: string) {
    try {
      setData(await me(t));
    } catch {
      router.push("/login");
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const target = e.target as typeof e.target & {
      name: { value: string };
      promos: { checked: boolean };
      line1: { value: string }; line2: { value: string };
      city: { value: string }; state: { value: string }; zip: { value: string };
    };
    try {
      await updateProfile(token!, {
        firstLastName: target.name.value,
        promotionsOptIn: target.promos.checked,
        address: {
          line1: target.line1.value,
          line2: target.line2.value,
          city: target.city.value,
          state: target.state.value,
          zip: target.zip.value
        }
      });
      setMsg("Profile saved");
      await load(token!);
    } catch (x: any) {
      setErr(x?.response?.data?.message || "Update failed");
    }
  }

  async function changePwd(e: FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const target = e.target as typeof e.target & {
      current: { value: string };
      new: { value: string };
    };
    try {
      await changePassword(token!, target.current.value, target.new.value);
      setMsg("Password changed");
    } catch (x: any) {
      setErr(x?.response?.data?.message || "Change password failed");
    }
  }

  async function addCardSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    const target = e.target as typeof e.target & {
      number: { value: string };
      month: { value: string }; year: { value: string };
      billingName: { value: string };
      bline1: { value: string }; bline2: { value: string };
      bcity: { value: string }; bstate: { value: string }; bzip: { value: string };
    };
    try {
      await addCard(token!, {
        number: target.number.value,
        expMonth: Number(target.month.value),
        expYear: Number(target.year.value),
        billingName: target.billingName.value,
        billingAddress: {
          line1: target.bline1.value,
          line2: target.bline2.value,
          city: target.bcity.value,
          state: target.bstate.value,
          zip: target.bzip.value
        }
      });
      setMsg("Card added");
      await load(token!);
    } catch (x: any) {
      setErr(x?.response?.data?.message || "Add card failed");
    }
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Back to Home
          </Link>
          <button className="text-red-600 underline" onClick={() => { clearToken(); router.push("/"); }}>Logout</button>
        </div>
      </div>

      {msg && <div className="text-green-600">{msg}</div>}
      {err && <div className="text-red-600">{err}</div>}

      {/* Profile Form */}
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

      {/* Change Password */}
      <form onSubmit={changePwd} className="space-y-2 border p-4 rounded">
        <div className="font-medium">Change password</div>
        <input name="current" className="border p-2 w-full" type="password" placeholder="Current password" required />
        <input name="new" className="border p-2 w-full" type="password" minLength={8} placeholder="New password" required />
        <button className="bg-black text-white px-4 py-2 rounded">Change</button>
      </form>

      {/* Payment Cards */}
      <div className="space-y-2 border p-4 rounded">
        <div className="font-medium">Payment cards (max 4)</div>
        <ul className="space-y-2">
          {data.paymentCards.map((c: any) => (
            <li key={c.id} className="flex flex-col gap-2 border-b pb-2">
              <div className="flex justify-between items-center">
                <span>{c.brand} •••• {c.last4}  (exp {c.expMonth}/{c.expYear})</span>
                <div className="flex gap-2">
                  <button
                    className="text-sm text-blue-600 underline"
                    onClick={() => setEditingCardId(c.id === editingCardId ? null : c.id)}
                  >
                    {editingCardId === c.id ? "Cancel" : "Edit"}
                  </button>
                  <button
                    className="text-sm text-red-600 underline"
                    onClick={async () => { await removeCard(token!, c.id); await load(token!); }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {editingCardId === c.id && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as typeof e.target & {
                      number?: { value: string };
                      month: { value: string };
                      year: { value: string };
                      billingName: { value: string };
                      bline1: { value: string };
                      bline2: { value: string };
                      bcity: { value: string };
                      bstate: { value: string };
                      bzip: { value: string };
                    };
                    try {
                      await updateCard(token!, c.id, {
                        number: target.number?.value || undefined, // optional card number edit
                        expMonth: Number(target.month.value),
                        expYear: Number(target.year.value),
                        billingName: target.billingName.value,
                        billingAddress: {
                          line1: target.bline1.value,
                          line2: target.bline2.value,
                          city: target.bcity.value,
                          state: target.bstate.value,
                          zip: target.bzip.value
                        }
                      });
                      setEditingCardId(null);
                      await load(token!);
                    } catch (x: any) {
                      setErr(x?.response?.data?.message || "Update card failed");
                    }
                  }}
                  className="grid grid-cols-2 gap-2 mt-2"
                >
                  <input name="month" type="number" min={1} max={12} defaultValue={c.expMonth} className="border p-2" required />
                  <input name="year" type="number" min={2024} max={2100} defaultValue={c.expYear} className="border p-2" required />
                  <input name="billingName" className="border p-2 col-span-2" defaultValue={c.billingName} required />
                  <input name="bline1" className="border p-2 col-span-2" defaultValue={c.billingAddress.line1} required />
                  <input name="bline2" className="border p-2 col-span-2" defaultValue={c.billingAddress.line2} />
                  <input name="bcity" className="border p-2" defaultValue={c.billingAddress.city} required />
                  <input name="bstate" className="border p-2" defaultValue={c.billingAddress.state} required />
                  <input name="bzip" className="border p-2" defaultValue={c.billingAddress.zip} required />
                  <button className="bg-black text-white px-4 py-2 rounded col-span-2">Save</button>
                </form>
              )}
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
