"use client";

import React from "react";
import Link from "next/link";

export default function ManageMoviesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Manage Movies</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Add Movie Card */}
          <Link
            href="/system-admin/add-movie"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-16 h-16 mb-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Add Movie</h2>
              <p className="text-gray-400">Add a new movie to the catalog</p>
            </div>
          </Link>

          {/* Edit Movie Card */}
          <Link
            href="/system-admin/edit-movie"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-16 h-16 mb-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Edit Movie</h2>
              <p className="text-gray-400">Update existing movie information</p>
            </div>
          </Link>

          {/* Delete Movie Card */}
          <Link
            href="/system-admin/delete-movie"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-16 h-16 mb-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Delete Movie</h2>
              <p className="text-gray-400">Remove movies from the catalog</p>
            </div>
          </Link>

          {/* Schedule Movie Card */}
          <Link
            href="/system-admin/schedule-movie"
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-16 h-16 mb-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Schedule Movie</h2>
              <p className="text-gray-400">Schedule showtimes for movies</p>
            </div>
          </Link>
        </div>

        {/* Back to Admin Dashboard */}
        <div className="mt-8">
          <Link
            href="/system-admin"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
