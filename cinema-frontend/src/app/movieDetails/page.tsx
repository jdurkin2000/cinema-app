"use client";

import { useState } from "react";
import Image from "next/image";
import { useMovies } from "@/libs/cinemaApi";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const params = useSearchParams();
  const movieId = params.get("id");

  const {
    movies,
    status
  } = useMovies({ id: movieId || "0" });
  const [selectedShowtime, setSelectedShowtime] = useState<Date | null>(null);
  const [isShowtimeOpen, setIsShowtimeOpen] = useState(false);

  const onPickShowtime = (time: Date) => {
    setSelectedShowtime(time);
    setIsShowtimeOpen(true);
  };

  const movie = movies[0];
  const currentState = status.currentState;
  const isLoading = currentState === "Loading";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="flex justify-between text-3xl md:text-4xl font-semibold tracking-tight">
            {movie.title}
            <Link href='/' className="rounded-md border px-3 py-2 text-2xl hover:shadow-sm shadow-gray-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
              Return to Homepage
            </Link>
          </h1>
          {!isLoading && (
            <p className="mt-1 text-sm opacity-80">
              Rating:{" "}
              <span className="inline-block rounded-full border px-2 py-0.5 text-xs align-middle">
                {movie.rating}
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
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  width={800}
                  height={1200}
                  className="h-auto w-full object-cover"
                  priority
                />
              )}
            </div>

            {/* Genres — split branches so map() always sees string[] */}
            <div className="flex flex-wrap gap-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className="animate-pulse w-16 h-6 rounded-full border px-3 py-1 text-xs"
                    />
                  ))
                : movie.genres.map((g: string, i) => (
                    <span
                      key={i}
                      className="rounded-full border px-3 py-1 text-xs"
                    >
                      {g}
                    </span>
                  ))}
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
                    <dd className="font-medium">{movie.director}</dd>
                  </div>
                  <div>
                    <dt className="opacity-70">Producer</dt>
                    <dd className="font-medium">{movie.producer}</dd>
                  </div>
                  {!!movie.cast.length && (
                    <div className="col-span-2">
                      <dt className="opacity-70">Cast</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {movie.cast.map((name: string, i) => (
                          <span
                            key={i}
                            className="rounded-md border px-2 py-0.5 text-xs"
                          >
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
                <p className="mt-3 leading-relaxed">{movie.synopsis}</p>
              )}
            </div>

            {/* Trailer */}
            <div className="rounded-2xl border p-4">
              <h2 className="mb-3 text-lg font-semibold">Trailer</h2>
              {isLoading ? (
                <div className="aspect-[16/9] w-full animate-pulse rounded-lg" />
              ) : movie.trailer ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <iframe
                    className="h-full w-full"
                    src={movie.trailer}
                    title={`${movie.title} trailer`}
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
                    <span
                      key={i}
                      className="h-8 w-20 animate-pulse rounded-md border"
                    />
                  ))}
                </div>
              ) : movie.showtimes.length ? (
                <ul className="mt-3 columns-2 gap-2">
                  {movie.showtimes.map((value: Date, index: number) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => onPickShowtime(value)}
                        className="mb-2 w-full text-left rounded-md border px-3 py-2 text-sm hover:shadow-sm shadow-white active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer"
                        aria-label={`Choose showtime ${value.toLocaleString()}`}
                      >
                        {value.toLocaleString()}
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
                  <h3 className="text-lg font-semibold">
                    Confirm your showtime
                  </h3>
                  <p className="mt-2 text-sm opacity-80">
                    {selectedShowtime
                      ? `You picked ${selectedShowtime.toLocaleString()}.`
                      : "Pick a time."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-md border px-4 py-2 text-sm hover:shadow-sm"
                      onClick={() => setIsShowtimeOpen(false)}
                    >
                      Cancel
                    </button>
                    <Link
                      type="button"
                      className="rounded-md border px-4 py-2 text-sm hover:shadow-sm"
                      href={{
                        pathname: "/movieBooking",
                        query: { id: movie.id, showtime: selectedShowtime?.toISOString() },
                      }}
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {currentState === "Error" && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4 text-sm">
                <p className="font-medium text-red-600">
                  Failed to load movie.
                </p>
                <p className="opacity-80">{status.message}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
