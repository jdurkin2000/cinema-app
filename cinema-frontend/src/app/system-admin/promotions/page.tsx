"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createPromotion,
  CreatePromotionPayload,
  sendPromotion,
  Promotion,
  getPromotions,
} from "@/libs/cinemaApi";
import { getToken } from "@/libs/authStore";
import { formatDate } from "@/utils/dateTimeUtil";
import "./promotions.css";

export default function PromotionsPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discountPercent, setDiscountPercent] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");

  const validate = () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return "Promo code is required.";
    if (trimmedCode.length > 6)
      return "Promo code is too long. Maximum length is 6 characters.";
    if (!startDate || !endDate) return "Start and end date are required.";

    const discount = Number(discountPercent);
    if (!Number.isFinite(discount) || discount < 1 || discount > 100)
      return "Discount must be a number between 1 and 100.";

    return null;
  };

  // Load current promotions from backend
  const loadPromotions = async () => {
    setPromosLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(data || []);
    } catch (err) {
      console.error("Failed to load promotions:", err);
      setPromotions([]);
    } finally {
      setPromosLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPromotions();
  }, []);

  const handleCreate = async () => {
    setError(null);
    setSuccess(null);

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setBusy(true);
    try {
      const payload: CreatePromotionPayload = {
        code: code.trim(),
        startDate,
        endDate,
        discountPercent: Number(discountPercent),
      };

      const token = getToken();
      const promotion = await createPromotion(payload, {
        token: token ?? undefined,
      });
      await loadPromotions();

      setSuccess(
        `Promotion "${promotion.code}" created successfully. Select it below to send to subscribers.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create promotion.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  // Optional: provide a button to use handleCreate directly

  return (
    <main className="promo-main">
      <div className="promo-wrapper">
        <header className="promo-header">
          <h1 className="promo-title">Manage Promotions</h1>
          <p className="promo-subtitle">
            Create a promotion, then send it to subscribed users.
          </p>
        </header>

        <form className="promo-form" onSubmit={(e) => e.preventDefault()}>
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <div>
            <label className="label">
              Promo Code<span className="required">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input"
              placeholder="FALL25"
            />
          </div>

          <div className="grid-2">
            <div>
              <label className="label">
                Start Date<span className="required">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">
                End Date<span className="required">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">
              Discount (%)<span className="required">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="input"
              placeholder="25"
            />
            <p className="help-text">Must be between 1 and 100.</p>
          </div>

          <div className="button-row">
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy}
              className="btn btn-green"
            >
              {busy ? "Working…" : "Create Promotion"}
            </button>

            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => router.push("/system-admin")}
            >
              Cancel
            </button>
          </div>
        </form>
        <section className="promotions-list mt-8">
          <h2 className="promo-subtitle">Current Promotions</h2>
          {promosLoading ? (
            <p>Loading promotions…</p>
          ) : promotions.length === 0 ? (
            <p>No promotions found.</p>
          ) : (
            <>
              <ul className="promo-list">
                {promotions.map((p) => (
                  <li key={p.id} className="promo-item">
                    <label className="promo-select-item">
                      <input
                        type="radio"
                        name="existing-promo"
                        value={p.id}
                        checked={selectedExistingId === p.id}
                        onChange={(e) => setSelectedExistingId(e.target.value)}
                      />
                      <strong className="ml-2">{p.code}</strong>
                      <span className="promo-meta">
                        {" "}
                        — {p.discountPercent}%
                      </span>
                      <span className="promo-meta">
                        {" "}
                        — {formatDate(p.startDate)} to {formatDate(p.endDate)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="button-row mt-4">
                <button
                  type="button"
                  disabled={busy || !selectedExistingId}
                  className="btn btn-green"
                  onClick={async () => {
                    setError(null);
                    setSuccess(null);
                    setBusy(true);
                    try {
                      const token = getToken();
                      const result = await sendPromotion(selectedExistingId, {
                        token: token ?? undefined,
                      });
                      await loadPromotions();
                      setSuccess(
                        `Existing promotion sent to ${result.emailsSent} subscribed user(s).`
                      );
                    } catch (err: unknown) {
                      const msg =
                        err instanceof Error
                          ? err.message
                          : "Failed to send existing promotion to subscribers.";
                      setError(msg);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Working…" : "Send Selected Promotion to Subscribers"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
