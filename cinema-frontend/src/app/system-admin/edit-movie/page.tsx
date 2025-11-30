"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Movie from "@/models/movie";
import axios from "axios";
import { MOVIES_API } from "@/config/apiConfig";

export default function EditMovieListPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await axios.get<Movie[]>(MOVIES_API, {
          transformResponse: [(data) => (data ? JSON.parse(data) : null)],
        });
        setMovies(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("Error fetching movies:", err);
        setError(err?.message || "Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Edit Movies</h1>
        <p className="text-lg text-gray-600">Loading movies... ⏳</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Edit Movies</h1>
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700 mb-4">
          {error}
        </div>
        <Link href="/system-admin" className="text-blue-600 hover:underline">
          Back to Admin Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8 bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Movies</h1>
        <Link
          href="/system-admin"
          className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white"
        >
          Back to Admin
        </Link>
      </div>

      {movies.length === 0 ? (
        <p className="text-lg text-gray-600">
          No movies found in the database.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/system-admin/edit-movie/${movie.id}`}
              className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <div className="bg-gray-100 h-48 overflow-hidden flex items-center justify-center">
                {(() => {
                  const safeImageSrc = (src?: string | null) => {
                    if (!src) return "/poster_loading.png";
                    if (
                      src.startsWith("/") ||
                      src.startsWith("http://") ||
                      src.startsWith("https://")
                    )
                      return src;
                    return "/poster_loading.png";
                  };
                  return movie.poster ? (
                    <img
                      src={safeImageSrc(movie.poster)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        try {
                          (e.target as HTMLImageElement).src =
                            "/poster_loading.png";
                        } catch {
                          (e.target as HTMLImageElement).style.display = "none";
                        }
                      }}
                    />
                  ) : (
                    <span className="text-gray-400">No Poster</span>
                  );
                })()}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-black">
                  {movie.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{movie.rating}</p>
                <p className="text-xs text-gray-500 line-clamp-3">
                  {movie.synopsis || "No description"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
