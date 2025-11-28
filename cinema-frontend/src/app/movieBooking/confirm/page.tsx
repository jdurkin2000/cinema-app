"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { dateReviver, useMovies } from "@/libs/cinemaApi";
import api from "@/libs/apiClient";
import { formatDateTime } from "@/utils/dateTimeUtil";
import { Showtime } from "@/models/shows";

export default function ConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();

  const raw = params.get("showtime");
  const showtime: Showtime = raw
    ? JSON.parse(decodeURIComponent(raw), dateReviver)
    : null;
  const seatsParam = params.get("seats") || "";
  const adult = parseInt(params.get("adult") || "0");
  const child = parseInt(params.get("child") || "0");
  const senior = parseInt(params.get("senior") || "0");

  const seats = seatsParam ? seatsParam.split(",").filter(Boolean) : [];

  const { movies } = useMovies({ id: showtime?.movieId || "0" });
  const movie = movies?.[0];

  const PRICES = { adult: 12.0, child: 8.0, senior: 10.0 };
  const subtotal =
    adult * PRICES.adult + child * PRICES.child + senior * PRICES.senior;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!showtime?.movieId || !showtime || seats.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // use shared axios instance which injects Authorization header
      const resp = await api.post("/bookings", { showtime, seats });
      const saved = resp.data;

      const booking = {
        movieId: showtime?.movieId,
        movieTitle: movie?.title || "Unknown",
        showtime: formatDateTime(showtime.start),
        seats,
        tickets: { adult, child, senior },
        subtotal,
        promo: appliedPromo
          ? {
              code: appliedPromo.code,
              discountPercent: appliedPromo.discountPercent,
            }
          : null,
        confirmedAt: new Date().toISOString(),
        backendShowroom: saved.id,
      };

      try {
        localStorage.setItem("lastBooking", JSON.stringify(booking));
      } catch (err) {
        console.warn("Failed to save booking locally:", err);
      }

      // Show confirmation modal instead of redirecting to profile
      setShowSuccessModal(true);
      setSavedBooking(booking);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Booking failed:", err);
        setError(err.message || "Failed to book seats");
      } else {
        console.error("Booking failed (non-error):", err);
        setError("Failed to book seats");
      }
    } finally {
      setLoading(false);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  type SavedBooking = {
    movieTitle?: string;
    showtime?: string;
    seats?: string[];
    [key: string]: unknown;
  };

  const [savedBooking, setSavedBooking] = useState<SavedBooking | null>(null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 space-y-6">
      <h1 className="text-3xl font-bold">Confirm Your Booking</h1>

      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-xl">
        <h2 className="text-xl font-semibold">Movie</h2>
        <p className="mb-2">{movie?.title || "Loading movie..."}</p>

        <h3 className="text-lg font-semibold">Showtime</h3>
        <p className="mb-2">
          {showtime ? formatDateTime(showtime.start) : "Unknown"}
        </p>

        <h3 className="text-lg font-semibold">Seats</h3>
        <p className="mb-2">
          {seats.length ? seats.join(", ") : "No seats selected"}
        </p>

        <h3 className="text-lg font-semibold">Tickets</h3>
        <p className="mb-2">
          Adult: {adult} • Child: {child} • Senior: {senior}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" htmlFor="promo">
            Promo Code
          </label>
          <div className="flex items-center gap-2">
            <input
              id="promo"
              name="promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.slice(0, 12))}
              placeholder="Enter promo code"
              maxLength={12}
              className="w-full max-w-xs rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
              onClick={async () => {
                if (!promoCode.trim()) return;
                setPromoLoading(true);
                setPromoError(null);
                try {
                  const res = await fetch(
                    `http://localhost:8080/api/promotions/validate?code=${encodeURIComponent(
                      promoCode.trim()
                    )}`
                  );
                  if (!res.ok) {
                    if (res.status === 404) {
                      setPromoError("Promo code not found");
                    } else {
                      const t = await res.text();
                      setPromoError(t || `Error ${res.status}`);
                    }
                    setAppliedPromo(null);
                    setPromoLoading(false);
                    return;
                  }
                  const promo = await res.json();
                  setAppliedPromo({
                    code: promo.code,
                    discountPercent: promo.discountPercent,
                  });
                } catch (err: unknown) {
                  if (err instanceof Error) {
                    console.error(err);
                  } else {
                    console.error("Unknown promo validation error", err);
                  }
                  setPromoError("Failed to validate promo code");
                  setAppliedPromo(null);
                } finally {
                  setPromoLoading(false);
                }
              }}
            >
              {promoLoading ? "Checking..." : "Apply"}
            </button>
            {appliedPromo && (
              <button
                className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoCode("");
                  setPromoError(null);
                }}
              >
                Remove
              </button>
            )}
          </div>
          {promoError && (
            <p className="text-red-400 text-sm mt-1">{promoError}</p>
          )}
          {appliedPromo && (
            <p className="text-green-400 text-sm mt-1">
              Applied: {appliedPromo.code} — {appliedPromo.discountPercent}% off
            </p>
          )}
        </div>

        <div className="border-t border-gray-700 mt-4 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between mt-2">
              <span className="text-sm">
                Discount ({appliedPromo.discountPercent}%)
              </span>
              <span className="text-sm">
                -${((subtotal * appliedPromo.discountPercent) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between mt-3 font-semibold">
            <span>Total</span>
            <span className="font-bold">
              $
              {(appliedPromo
                ? subtotal * (1 - appliedPromo.discountPercent / 100)
                : subtotal
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded w-full max-w-xl space-y-2">
          <div>{error}</div>
          {(() => {
            const needsLogin = /log in/i.test(error);
            if (!needsLogin) return null;
            const nextUrl = (() => {
              if (typeof window === "undefined") return "/";
              const url = new URL(window.location.href);
              return url.pathname + (url.search || "");
            })();
            const loginHref = `/login?next=${encodeURIComponent(nextUrl)}`;
            return (
              <a
                href={loginHref}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
              >
                Go to Login
              </a>
            );
          })()}
        </div>
      )}

      <div className="flex gap-4">
        <button
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded text-lg"
          onClick={async () => {
            await handleConfirm();
          }}
          disabled={seats.length === 0 || loading}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>

        <button
          className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded text-lg"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>

      {/* Success modal shown after booking completes */}
      {showSuccessModal && savedBooking && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed</h2>
            <p className="mb-2">Your seats have been reserved.</p>
            <div className="mb-4">
              <div className="text-sm text-gray-300">Movie</div>
              <div className="font-semibold">{savedBooking.movieTitle}</div>
              <div className="text-sm text-gray-300 mt-2">Showtime</div>
              <div className="font-semibold">{savedBooking.showtime}</div>
              <div className="text-sm text-gray-300 mt-2">Seats</div>
              <div className="font-semibold">
                {(savedBooking.seats || []).join(", ")}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/");
                }}
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
