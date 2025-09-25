"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Movie from "@/models/movie";

export default function Home() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [isShowtimeOpen, setIsShowtimeOpen] = useState(false);

  const onPickShowtime = (time: string) => {
    setSelectedShowtime(time);
    setIsShowtimeOpen(true);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
  const query = useMemo(
    () => new URLSearchParams({ title: "slayer" }).toString(),
    []
  );

  useEffect(() => {
    const ac = new AbortController();

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/movies?${query}`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        // make JSON typed to avoid 'unknown'
        const data = (await res.json()) as Movie[];
        setMovie(data?.[0] ?? null);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message ?? "Something went wrong fetching the movie.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    run();
    return () => ac.abort();
  }, [API_BASE, query]);

  // --- UI helpers (typed arrays to avoid 'unknown') ---
  const posterSrc = movie?.poster || "/poster_placeholder.png";
  const title = movie?.title ?? "Untitled";
  const rating = movie?.rating ?? "NR";
  const synopsis = movie?.synopsis ?? "No synopsis available.";
  const genres: string[] = movie?.genres ?? [];
  const showtimes: string[] = (movie?.showtimes ?? []).filter(Boolean) as string[];
  const cast: string[] = movie?.cast ?? [];
  const director = movie?.director ?? "Unknown";
  const producer = movie?.producer ?? "Unknown";
  const trailer = movie?.trailer ?? "";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
          {!isLoading && (
            <p className="mt-1 text-sm opacity-80">
              Rating:{" "}
              <span className="inline-block rounded-full border px-2 py-0.5 text-xs align-middle">
                {rating}
              </span>
            </p>
          )}
        </header>

        {/* Content */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Poster + quick facts */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl shadow-sm border">
              {/* Poster skeleton vs. image */}
              {isLoading ? (
                <div className="h-[420px] w-full animate-pulse" />
              ) : (
                <Image
                  src={posterSrc}
                  alt={`${title} poster`}
                  width={800}
                  height={1200}
                  className="h-auto w-full object-cover"
                  priority
                />
              )}
            </div>

            {/* Genres — split branches so map() always sees string[] */}
            <div className="flex flex-wrap gap-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="animate-pulse w-16 h-6 rounded-full border px-3 py-1 text-xs"
                  />
                ))
              ) : (
                genres.map((g: string, i) => (
                  <span key={i} className="rounded-full border px-3 py-1 text-xs">
                    {g}
                  </span>
                ))
              )}
            </div>

            {/* Cast/Crew */}
            <div className="rounded-2xl border p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse" />
                  <div className="h-4 w-28 animate-pulse" />
                </div>
              ) : (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="opacity-70">Director</dt>
                    <dd className="font-medium">{director}</dd>
                  </div>
                  <div>
                    <dt className="opacity-70">Producer</dt>
                    <dd className="font-medium">{producer}</dd>
                  </div>
                  {!!cast.length && (
                    <div className="col-span-2">
                      <dt className="opacity-70">Cast</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {cast.map((name: string, i) => (
                          <span key={i} className="rounded-md border px-2 py-0.5 text-xs">
                            {name}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </div>

          {/* Details + trailer */}
          <div className="space-y-5">
            {/* Synopsis */}
            <div className="rounded-2xl border p-5">
              <h2 className="text-lg font-semibold">Synopsis</h2>
              {isLoading ? (
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-full animate-pulse" />
                  <div className="h-4 w-11/12 animate-pulse" />
                  <div className="h-4 w-10/12 animate-pulse" />
                </div>
              ) : (
                <p className="mt-3 leading-relaxed">{synopsis}</p>
              )}
            </div>

            {/* Trailer */}
            <div className="rounded-2xl border p-4">
              <h2 className="mb-3 text-lg font-semibold">Trailer</h2>
              {isLoading ? (
                <div className="aspect-[16/9] w-full animate-pulse rounded-lg" />
              ) : trailer ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <iframe
                    className="h-full w-full"
                    src={trailer}
                    title={`${title} trailer`}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="opacity-70">No trailer available.</p>
              )}
            </div>

            {/* Showtimes */}
            <div className="rounded-2xl border p-5">
              <h2 className="text-lg font-semibold">Available showtimes</h2>
              {isLoading ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="h-8 w-20 animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : showtimes.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {showtimes.map((value: string, index: number) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => onPickShowtime(value)}
                        className="rounded-md border px-3 py-2 text-sm hover:shadow-sm active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        aria-label={`Choose showtime ${value}`}
                      >
                        {value}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 opacity-70">No upcoming showtimes listed.</p>
              )}
            </div>

            {/* Showtime modal */}
            {isShowtimeOpen && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
              >
                <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-lg">
                  <h3 className="text-lg font-semibold">Confirm your showtime</h3>
                  <p className="mt-2 text-sm opacity-80">
                    {selectedShowtime ? `You picked ${selectedShowtime}.` : "Pick a time."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-md border px-4 py-2 text-sm hover:shadow-sm"
                      onClick={() => setIsShowtimeOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-4 py-2 text-sm hover:shadow-sm"
                      onClick={() => {
                        setIsShowtimeOpen(false);
                        // TODO: navigate to /booking or perform an action
                        alert(`Proceeding with showtime: ${selectedShowtime}`);
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm">
                <p className="font-medium text-red-600">Failed to load movie.</p>
                <p className="opacity-80">{error}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
