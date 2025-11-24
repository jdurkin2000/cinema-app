"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPromotion,
  CreatePromotionPayload,
  sendPromotion,
} from "@/libs/cinemaApi";
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
  const [lastPromotionId, setLastPromotionId] = useState<string | null>(null);

  const validate = () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return "Promo code is required.";
    if (!startDate || !endDate) return "Start and end date are required.";

    const discount = Number(discountPercent);
    if (!Number.isFinite(discount) || discount < 1 || discount > 100)
      return "Discount must be a number between 1 and 100.";

    return null;
  };

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

      const promotion = await createPromotion(payload);
      setLastPromotionId(promotion.id);

      setSuccess(`Promotion created (ID: ${promotion.id}). You can now send it.`);
    } catch (err: any) {
      setError(err.message || "Failed to create promotion.");
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      let promotionId = lastPromotionId;

      // If we don't have a created promotion yet, create it from the form data
      if (!promotionId) {
        const validation = validate();
        if (validation) {
          setError(validation);
          setBusy(false);
          return;
        }

        const payload: CreatePromotionPayload = {
          code: code.trim(),
          startDate,
          endDate,
          discountPercent: Number(discountPercent),
        };

        const created = await createPromotion(payload);
        promotionId = created.id;
        setLastPromotionId(promotionId);
        setSuccess(`Promotion created (ID: ${promotionId}).`);
      }

      // Now send the promotion email
      const result = await sendPromotion(promotionId);
      setSuccess(`Promotion sent to ${result.emailsSent} subscribed user(s).`);
    } catch (err: any) {
      setError(err.message || "Failed to send promotion.");
    } finally {
      setBusy(false);
    }
  };

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
              className="btn btn-purple"
            >
              {busy ? "Working…" : "Add Promotion"}
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={busy}
              className="btn btn-green"
            >
              {busy ? "Working…" : "Send Promotion"}
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
      </div>
    </main>
  );
}
