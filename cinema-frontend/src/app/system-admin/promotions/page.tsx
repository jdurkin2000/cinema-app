"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPromotion,
  CreatePromotionPayload,
  sendPromotion,
} from "@/libs/cinemaApi";

/**
 * Admin / Promotions
 * - Lets an admin create a promotion (code, start/end date, discount %)
 * - Validates inputs on the client and relies on backend validation
 * - On success, immediately sends the promotion email
 *   to subscribed users only (promotionsOptIn = true)
 */
export default function PromotionsPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [discountPercent, setDiscountPercent] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Promo code is required.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and end date are required.");
      return;
    }

    const discount = Number(discountPercent);
    if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
      setError("Discount must be a number between 1 and 100.");
      return;
    }

    setBusy(true);
    try {
      const payload: CreatePromotionPayload = {
        code: trimmedCode,
        startDate,
        endDate,
        discountPercent: discount,
      };

      // 1) Create the promotion (backend validates everything again)
      const promotion = await createPromotion(payload);

      // 2) Immediately send to subscribed users only
      const result = await sendPromotion(promotion.id);

      setSuccess(
        `Promotion created and emailed to ${result.emailsSent} subscribed user(s).`
      );

      // Optional: clear the form
      setCode("");
      setStartDate("");
      setEndDate("");
      setDiscountPercent("");
    } catch (err: any) {
      setError(err.message || "Failed to create/send promotion.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Manage Promotions</h1>
          <p className="mt-2 text-sm text-slate-300">
            Create a promotion and email it to subscribed users only.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-slate-900/70 p-6 shadow-lg ring-1 ring-slate-700"
        >
          {error && (
            <div className="rounded border border-red-500 bg-red-500/10 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Promo Code<span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              placeholder="FALL25"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start Date<span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                End Date<span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Discount (%)<span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              placeholder="25"
            />
            <p className="mt-1 text-xs text-slate-400">
              Must be between 1 and 100.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold shadow hover:bg-purple-500 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Create & Send Promotion"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/system-admin")}
              className="rounded-md border border-slate-500 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
