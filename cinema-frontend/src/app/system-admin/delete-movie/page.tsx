"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Movie from "@/models/movie";
import apiClient from "@/libs/apiClient";

export default function DeleteMoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      const res = await apiClient.get<Movie[]>("/movies", {
        transformResponse: [(data) => (data ? JSON.parse(data) : null)],
      });
      setMovies(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching movies:", err);
      setError(err?.message || "Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(movieId: string, movieTitle: string) {
    if (
      !confirm(
        `Are you sure you want to delete "${movieTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(movieId);
    setDeleteSuccess(null);
    setError(null);

    try {
      await apiClient.delete(`/movies/${movieId}`);

      setDeleteSuccess(`Successfully deleted "${movieTitle}"`);
      // Remove from local state
      setMovies((prev) => prev.filter((m) => m.id !== movieId));

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error deleting movie:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete movie";
      setError(`Failed to delete "${movieTitle}": ${message}`);
    } finally {
      setDeleteLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Delete Movies</h1>
          <p className="text-lg text-gray-400">Loading movies... ⏳</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Delete Movies</h1>

        {error && (
          <div className="rounded border border-red-600 bg-red-900 bg-opacity-50 px-4 py-3 text-red-200 mb-4">
            {error}
          </div>
        )}

        {deleteSuccess && (
          <div className="rounded border border-green-600 bg-green-900 bg-opacity-50 px-4 py-3 text-green-200 mb-4">
            {deleteSuccess}
          </div>
        )}

        {movies.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">No movies found in the database.</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Poster
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Genres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {movies.map((movie) => (
                    <tr
                      key={movie.id}
                      className="hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={movie.poster || "/poster_loading.png"}
                          alt={movie.title}
                          className="h-16 w-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/poster_loading.png";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{movie.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {movie.genres?.join(", ") || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-700 text-gray-300">
                          {movie.rating || "NR"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          disabled={deleteLoading === movie.id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition-colors"
                        >
                          {deleteLoading === movie.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/system-admin/manage-movies"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Back to Manage Movies
          </Link>
        </div>
      </div>
    </main>
  );
}
