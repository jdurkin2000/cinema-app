"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/libs/apiClient";
import TicketPrice from "@/models/ticketPrice";

type PriceRow = {
  id: string;
  type: "ADULT" | "CHILD" | "SENIOR";
  price: number;
};

export default function ManagePricesPage() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<TicketPrice[]>("/tickets/prices", {
          transformResponse: [(d) => (d ? JSON.parse(d) : null)],
        });
        const list = Array.isArray(res.data) ? res.data : [];
        // Normalize to expected shape
        const mapped: PriceRow[] = list.map((it) => ({
          id: it.id,
          type: it.type,
          price: typeof it.price === "number" ? it.price : 0,
        }));
        // Ensure all three exist even if DB is missing one
        const ensure = (t: PriceRow["type"]) =>
          mapped.find((m) => m.type === t) || {
            id: "unknown-" + t,
            type: t,
            price: 0,
          };
        const finalRows = [ensure("ADULT"), ensure("CHILD"), ensure("SENIOR")];
        setRows(finalRows);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load prices";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const typeLabel = useMemo(
    () => ({ ADULT: "Adult", CHILD: "Child", SENIOR: "Senior" } as const),
    []
  );

  async function updatePrice(row: PriceRow) {
    setError(null);
    setMessages((m) => ({ ...m, [row.type]: "" }));
    setSaving((s) => ({ ...s, [row.type]: true }));
    try {
      // Backend ignores id, looks up by type; still pass id to match signature
      await api.put(`/tickets/prices/${row.id}`, {
        type: row.type,
        price: row.price,
      });
      setMessages((m) => ({ ...m, [row.type]: "Saved" }));
      setTimeout(() => setMessages((m) => ({ ...m, [row.type]: "" })), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      setError(msg);
    } finally {
      setSaving((s) => ({ ...s, [row.type]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Manage Ticket Prices</h1>

        {error && (
          <div className="rounded border border-red-600 bg-red-900/50 text-red-200 px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading current prices...</div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Ticket Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Price ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {rows.map((row) => (
                  <tr key={row.type} className="hover:bg-gray-800">
                    <td className="px-4 py-3">{typeLabel[row.type]}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={Number.isFinite(row.price) ? row.price : 0}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setRows((prev) =>
                            prev.map((r) =>
                              r.type === row.type
                                ? { ...r, price: isNaN(v) ? 0 : v }
                                : r
                            )
                          );
                        }}
                        className="w-28 rounded border border-gray-700 bg-gray-800 px-3 py-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updatePrice(row)}
                        disabled={saving[row.type]}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-2 rounded text-sm"
                      >
                        {saving[row.type] ? "Saving..." : "Save"}
                      </button>
                      {messages[row.type] && (
                        <span className="ml-3 text-green-400 text-sm">
                          {messages[row.type]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/system-admin"
            className="inline-block bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
