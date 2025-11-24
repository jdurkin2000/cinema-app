"use client";
import { useEffect, useState, FormEvent } from "react";
import {
  addCard,
  changePassword,
  me,
  removeCard,
  updateCard,
  updateProfile,
} from "@/libs/authApi";
import { clearToken, getToken } from "@/libs/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./profile.css";

export default function Profile() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Controlled address fields
  const [name, setName] = useState("");
  const [addr1, setAddr1] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    load(t);
  }, []);

  async function load(t: string) {
    try {
      const res = await me(t);
      setData(res);

      setName(res.name || "");
      setAddr1(res.address?.line1 || "");
      setCity(res.address?.city || "");
      setStateVal(res.address?.state || "");
      setZip(res.address?.zip || "");
    } catch {
      router.push("/login");
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const target = e.target as any;

    if (!target.line1.value || !target.city.value || !target.state.value || !target.zip.value) {
      setErr("Please fill out all required address fields.");
      return;
    }

    try {
      await updateProfile(token!, {
        firstLastName: target.name.value,
        promotionsOptIn: target.promos.checked,
        address: {
          line1: target.line1.value,
          line2: target.line2.value,
          city: target.city.value,
          state: target.state.value,
          zip: target.zip.value,
        },
      });

      setMsg("Profile saved");
      await load(token!);
    } catch (x: any) {
      setErr(x?.response?.data?.message || "Update failed");
    }
  }

  async function changePwd(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const target = e.target as any;

    try {
      await changePassword(token!, target.current.value, target.new.value);
      setMsg("Password changed");
    } catch (x: any) {
      setErr(x?.response?.data?.message || "Change password failed");
    }
  }

  async function addCardSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const target = e.target as any;

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
          zip: target.bzip.value,
        },
      });

      setMsg("Card added");
      await load(token!);
    } catch (x: any) {
      setErr(x?.response?.data?.message || "Add card failed");
    }
  }

  if (!data) return null;

  // Reactive boolean for disabling Save button
  const canSave = name.trim() !== "" && addr1.trim() !== "" && city.trim() !== "" && stateVal.trim() !== "" && zip.trim() !== "";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-header-actions">
          <Link href="/" className="profile-btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>

      {msg && <div className="profile-msg">{msg}</div>}
      {err && <div className="profile-err">{err}</div>}

      {/* Profile Form */}
      <form onSubmit={saveProfile} className="profile-section">
        <div className="section-title">Profile</div>
        
        <input
          name="name"
          className="input"
          placeholder="Full name"
          value={name}           // <-- controlled value
          required
          onChange={(e) => setName(e.target.value)}  // <-- update state
        />

       

        <input value={data.email} disabled className="input disabled" />

        <label className="checkbox-row">
          <input name="promos" type="checkbox" defaultChecked={data.promotionsOptIn} />
          <span>Receive promotions</span>
        </label>

        <div className="grid-2">
          <input
            name="line1"
            className="input"
            placeholder="Address line 1"
            value={addr1}
            required
            onChange={(e) => setAddr1(e.target.value)}
          />
          <input
            name="line2"
            className="input"
            placeholder="Address line 2"
            defaultValue={data.address?.line2 || ""}
          />
          <input
            name="city"
            className="input"
            placeholder="City"
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            name="state"
            className="input"
            placeholder="State"
            value={stateVal}
            required
            onChange={(e) => setStateVal(e.target.value)}
          />
          <input
            name="zip"
            className="input"
            placeholder="ZIP"
            value={zip}
            required
            onChange={(e) => setZip(e.target.value)}
          />
        </div>

        <button
          className="profile-btn-primary"
          disabled={!canSave}
        >
          Save
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={changePwd} className="profile-section">
        <div className="section-title">Change password</div>
        <input name="current" type="password" placeholder="Current password" required className="input" />
        <input name="new" type="password" placeholder="New password" minLength={8} required className="input" />
        <button className="profile-btn-primary">Change</button>
      </form>

      {/* Payment Cards */}
      <div className="profile-section">
        <div className="section-title">Payment cards (max 4)</div>

        <ul className="cards-list">
          {data.paymentCards.map((c: any) => (
            <li key={c.id} className="card-item">
              <div className="card-top-row">
                <span>
                  {c.brand} •••• {c.last4} (exp {c.expMonth}/{c.expYear})
                </span>

                <div className="card-actions">
                  <button
                    className="link-btn"
                    onClick={() =>
                      setEditingCardId(editingCardId === c.id ? null : c.id)
                    }
                  >
                    {editingCardId === c.id ? "Cancel" : "Edit"}
                  </button>

                  <button
                    className="link-btn danger"
                    onClick={async () => {
                      await removeCard(token!, c.id);
                      await load(token!);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {editingCardId === c.id && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as any;

                    try {
                      await updateCard(token!, c.id, {
                        number: target.number?.value || undefined,
                        expMonth: Number(target.month.value),
                        expYear: Number(target.year.value),
                        billingName: target.billingName.value,
                        billingAddress: {
                          line1: target.bline1.value,
                          line2: target.bline2.value,
                          city: target.bcity.value,
                          state: target.bstate.value,
                          zip: target.bzip.value,
                        },
                      });

                      setEditingCardId(null);
                      await load(token!);
                    } catch (x: any) {
                      setErr(x?.response?.data?.message || "Update card failed");
                    }
                  }}
                  className="grid-2 edit-card-grid"
                >
                  <input name="month" type="number" min={1} max={12} defaultValue={c.expMonth} required className="input" />
                  <input name="year" type="number" min={2024} max={2100} defaultValue={c.expYear} required className="input" />
                  <input name="billingName" className="input col-2" defaultValue={c.billingName} required />
                  <input name="bline1" className="input col-2" defaultValue={c.billingAddress.line1} required />
                  <input name="bline2" className="input col-2" defaultValue={c.billingAddress.line2} />
                  <input name="bcity" className="input" defaultValue={c.billingAddress.city} required />
                  <input name="bstate" className="input" defaultValue={c.billingAddress.state} required />
                  <input name="bzip" className="input" defaultValue={c.billingAddress.zip} required />
                  <button className="profile-btn-primary col-2">Save</button>
                </form>
              )}
            </li>
          ))}
        </ul>

        {data.paymentCards.length < 4 && (
          <form onSubmit={addCardSubmit} className="grid-2 add-card-grid">
            <input name="number" className="input col-2" placeholder="Card number" required />
            <input name="month" className="input" placeholder="MM" type="number" min={1} max={12} required />
            <input name="year" className="input" placeholder="YYYY" type="number" min={2024} max={2100} required />
            <input name="billingName" className="input col-2" placeholder="Billing name" required />
            <input name="bline1" className="input col-2" placeholder="Billing address line 1" required />
            <input name="bline2" className="input col-2" placeholder="Billing address line 2" />
            <input name="bcity" className="input" placeholder="City" required />
            <input name="bstate" className="input" placeholder="State" required />
            <input name="bzip" className="input" placeholder="ZIP" required />
            <button className="profile-btn-primary col-2">Add card</button>
          </form>
        )}
      </div>
    </div>
  );
}
