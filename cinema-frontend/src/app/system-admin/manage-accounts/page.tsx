"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/libs/apiClient";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

export default function ManageAccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<User[]>("/admin/users", {
          transformResponse: [(d) => (d ? JSON.parse(d) : null)],
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createAdmin() {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) return;
    setCreating(true);
    setError(null);
    try {
      await api.post("/admin/users/create-admin", newAdmin);
      setNewAdmin({ name: "", email: "", password: "" });
      const res = await api.get<User[]>("/admin/users");
      setUsers(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreating(false);
    }
  }

  async function suspend(id: string) {
    await api.post(`/admin/users/${id}/suspend`);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "SUSPENDED" } : u))
    );
  }
  async function unsuspend(id: string) {
    await api.post(`/admin/users/${id}/unsuspend`);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "ACTIVE" } : u))
    );
  }
  async function remove(id: string) {
    if (!confirm("Delete this account?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Manage Accounts</h1>
        {error && (
          <div className="rounded border border-red-600 bg-red-900/50 text-red-200 px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Create Admin */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Name"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
              className="rounded border border-gray-700 bg-gray-800 px-3 py-2"
            />
            <input
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
              className="rounded border border-gray-700 bg-gray-800 px-3 py-2"
            />
            <input
              placeholder="Password"
              type="password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="rounded border border-gray-700 bg-gray-800 px-3 py-2"
            />
          </div>
          <button
            onClick={createAdmin}
            disabled={creating}
            className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            {creating ? "Creating..." : "Create Admin"}
          </button>
        </div>

        {/* Accounts table */}
        {loading ? (
          <div className="text-gray-400">Loading accounts...</div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-700">
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {u.status !== "SUSPENDED" ? (
                        <button
                          onClick={() => suspend(u.id)}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => unsuspend(u.id)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          Unsuspend
                        </button>
                      )}
                      <button
                        onClick={() => remove(u.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
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
