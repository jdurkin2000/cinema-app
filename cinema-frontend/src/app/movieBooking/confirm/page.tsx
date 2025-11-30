"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { dateReviver, useMovies } from "@/libs/cinemaApi";
import api from "@/libs/apiClient";
import { formatDateTime } from "@/utils/dateTimeUtil";
import { Showtime } from "@/models/shows";
import { getToken } from "@/libs/authStore";
import { me } from "@/libs/authApi";
import TicketPrice from "@/models/ticketPrice";

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

  const [prices, setPrices] = useState({ adult: 0, child: 0, senior: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [zipCode, setZipCode] = useState<string>("");
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [hasProfileZip, setHasProfileZip] = useState<boolean>(false);
  const [hasPaymentCard, setHasPaymentCard] = useState<boolean | null>(null);
  // Stable login redirect href to avoid hydration mismatch
  const [loginHref, setLoginHref] = useState<string>("/login?next=%2F");

  // Compute login redirect only on client after mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const next = window.location.pathname + (window.location.search || "");
        setLoginHref(`/login?next=${encodeURIComponent(next)}`);
      }
    } catch { }
  }, []);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Track auth token presence and update state when storage changes
  useEffect(() => {
    const check = () => setIsLoggedIn(!!getToken());
    check();
    const handler = () => check();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Fetch user profile on mount to get ZIP code from address and auto-fetch tax
  useEffect(() => {
    const fetchProfileZip = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const profile = await me(token);
        if (profile) {
          setHasPaymentCard(
            Array.isArray(profile.paymentCards) && profile.paymentCards.length > 0
          );
        }
        if (profile?.address?.zip) {
          const profileZip = profile.address.zip.replace(/\D/g, "").slice(0, 5);
          setZipCode(profileZip);
          setHasProfileZip(true);
          // Auto-fetch tax rate if we have a valid 5-digit ZIP
          if (profileZip.length === 5) {
            setTaxLoading(true);
            try {
              const res = await fetch(
                `https://api.api-ninjas.com/v1/salestax?zip_code=${profileZip}`,
                {
                  headers: {
                    "X-Api-Key": "BgZqtN2qMXsBPuX0FHh7ng==Y2MaxSXOhhKIdpbu",
                  },
                }
              );
              if (res.ok) {
                const data = await res.json();
                console.log(data);
                // API returns an array with one object
                const taxData = Array.isArray(data) ? data[0] : data;
                if (taxData && taxData.state_rate !== undefined) {
                  const rate =
                    typeof taxData.state_rate === "string"
                      ? parseFloat(taxData.state_rate)
                      : taxData.state_rate;
                  setSalesTaxRate(rate);
                }
              }
            } catch (err) {
              console.warn("Failed to auto-fetch tax rate:", err);
            } finally {
              setTaxLoading(false);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user profile for ZIP code:", err);
      }
    };

    const fetchTicketPrices = async () => {
      try {
        // Use shared api client so base URL + auth (if needed) are applied
        const res = await api.get<TicketPrice[]>("/tickets/prices", {
          transformResponse: [(data) => (data ? JSON.parse(data) : null)],
        });
        const data = Array.isArray(res.data) ? res.data : [];

        // Normalize to lowercase keys and avoid mutating existing state object
        const normalized: { adult: number; child: number; senior: number } = {
          adult: 0,
          child: 0,
          senior: 0,
        };
        for (const item of data as Array<
          Partial<TicketPrice> & { ticketType?: string }
        >) {
          // Support either backend JSON key 'type' or legacy 'ticketType'
          const rawType = item.type || item.ticketType;
          if (!rawType || typeof rawType !== "string") continue;
          const key = rawType.toLowerCase();
          if (key === "adult" || key === "child" || key === "senior") {
            const priceVal = typeof item.price === "number" ? item.price : 0;
            normalized[key as keyof typeof normalized] = priceVal;
          }
        }
        setPrices(normalized);
      } catch (err) {
        console.warn("Failed to get ticket prices:", err);
      }
    };

    fetchProfileZip();
    fetchTicketPrices();
    // Run only once on mount; subsequent price-dependent recalculations handled elsewhere
  }, []);

  // Derived totals
  const baseSubtotal =
    adult * prices.adult + child * prices.child + senior * prices.senior;
  const afterPromo = appliedPromo
    ? baseSubtotal * (1 - appliedPromo.discountPercent / 100)
    : baseSubtotal;
  const taxAmount = afterPromo * salesTaxRate;
  const grandTotal = afterPromo + taxAmount;

  const handleConfirm = async () => {
    if (!isLoggedIn) {
      setError("Please log in to confirm booking.");
      return;
    }
    if (!showtime?.movieId || !showtime || seats.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // use shared axios instance which injects Authorization header
      const resp = await api.post("/bookings", { showtime, seats, ticketCounts: { adult, child, senior } });
      const saved = resp.data;

      const booking = {
        movieId: showtime?.movieId,
        movieTitle: movie?.title || "Unknown",
        showtime: formatDateTime(showtime.start),
        seats,
        tickets: { adult, child, senior },
        subtotal: { value: baseSubtotal },
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
        {!isLoggedIn && (
          <div className="mb-4 rounded border border-yellow-600 bg-yellow-900 bg-opacity-40 p-3 text-sm text-yellow-200">
            You must be logged in to confirm this booking.
            <a href={loginHref} className="ml-2 underline hover:text-white">
              Log in
            </a>
          </div>
        )}

        {isLoggedIn && hasPaymentCard === false && (
          <div className="mb-4 rounded border border-yellow-600 bg-yellow-900 bg-opacity-40 p-3 text-sm text-yellow-200">
            You don't have a payment card associated with your account.
            <a href="/profile" className="ml-2 underline hover:text-white">
              Add a payment method
            </a>
          </div>
        )}

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

        {!hasProfileZip && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1" htmlFor="zipCode">
              ZIP Code (for sales tax)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="zipCode"
                name="zipCode"
                value={zipCode}
                onChange={(e) =>
                  setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                placeholder="Enter ZIP code"
                maxLength={5}
                className="w-full max-w-xs rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
                onClick={async () => {
                  if (!zipCode.trim() || zipCode.length !== 5) {
                    setTaxError("Please enter a valid 5-digit ZIP code");
                    return;
                  }
                  setTaxLoading(true);
                  setTaxError(null);
                  try {
                    const res = await fetch(
                      `https://api.api-ninjas.com/v1/salestax?zip_code=${zipCode}`,
                      {
                        headers: {
                          "X-Api-Key":
                            "BgZqtN2qMXsBPuX0FHh7ng==Y2MaxSXOhhKIdpbu",
                        },
                      }
                    );
                    if (!res.ok) {
                      setTaxError(`Error fetching tax rate: ${res.status}`);
                      setSalesTaxRate(0);
                      setTaxLoading(false);
                      return;
                    }
                    const data = await res.json();
                    // API returns an array with one object
                    const taxData = Array.isArray(data) ? data[0] : data;
                    if (taxData && taxData.state_rate !== undefined) {
                      const rate =
                        typeof taxData.state_rate === "string"
                          ? parseFloat(taxData.state_rate)
                          : taxData.state_rate;
                      setSalesTaxRate(rate);
                    } else {
                      setTaxError("Invalid response from tax API");
                      setSalesTaxRate(0);
                    }
                  } catch (err: unknown) {
                    if (err instanceof Error) {
                      console.error(err);
                    } else {
                      console.error("Unknown tax API error", err);
                    }
                    setTaxError("Failed to fetch sales tax rate");
                    setSalesTaxRate(0);
                  } finally {
                    setTaxLoading(false);
                  }
                }}
              >
                {taxLoading ? "Fetching..." : "Get Tax Rate"}
              </button>
            </div>
            {taxError && (
              <p className="text-red-400 text-sm mt-1">{taxError}</p>
            )}
            {salesTaxRate > 0 && (
              <p className="text-green-400 text-sm mt-1">
                Sales tax rate: {(salesTaxRate * 100).toFixed(2)}%
              </p>
            )}
          </div>
        )}

        <div className="border-t border-gray-700 mt-4 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold">${baseSubtotal.toFixed(2)}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between mt-2">
              <span className="text-sm">
                Discount ({appliedPromo.discountPercent}%)
              </span>
              <span className="text-sm">
                -$
                {((baseSubtotal * appliedPromo.discountPercent) / 100).toFixed(
                  2
                )}
              </span>
            </div>
          )}
          {(() => {
            return (
              <>
                {salesTaxRate > 0 && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">
                      Sales Tax ({(salesTaxRate * 100).toFixed(2)}%)
                    </span>
                    <span className="text-sm">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mt-3 font-semibold">
                  <span>Total</span>
                  <span className="font-bold">${grandTotal.toFixed(2)}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded w-full max-w-xl space-y-2">
          <div>{error}</div>
          {(() => {
            const needsLogin = /log in/i.test(error);
            if (!needsLogin) return null;
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
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={
            seats.length === 0 ||
            loading ||
            !isLoggedIn ||
            (isLoggedIn && hasPaymentCard === false)
          }
        >
          {isLoggedIn
            ? loading
              ? "Processing..."
              : "Confirm Booking"
            : "Login Required"}
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
