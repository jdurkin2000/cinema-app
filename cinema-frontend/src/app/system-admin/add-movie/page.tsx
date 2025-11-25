"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMovie, CreateMoviePayload } from "@/libs/cinemaApi";

function hasDuplicateStrings(arr: string[]): boolean {
  const seen = new Set<string>();

  for (const s of arr) {
    if (seen.has(s)) return true; // found a duplicate
    seen.add(s);
  }

  return false;
}

/**
 * Admin / Add Movie
 * - Validates required fields (title, poster, trailer, rating)
 * - Accepts comma/line separated lists for genres/cast/reviews/showtimes
 * - Sends ISO strings for dates so Spring can parse LocalDate/LocalDateTime
 * - Redirects back to /system-admin on success
 */
export default function AddMoviePage() {
  const router = useRouter();

  // Required fields
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [trailer, setTrailer] = useState("");
  const [rating, setRating] = useState("NR");

  // Optional fields
  const [director, setDirector] = useState("");
  const [producer, setProducer] = useState("");
  const [synopsis, setSynopsis] = useState("");

  // List inputs (comma or newline separated)
  const [genresText, setGenresText] = useState("");
  const [castText, setCastText] = useState("");
  const [reviewsText, setReviewsText] = useState("");
  // Removed showtimes/released/upcoming per refactor

  // UX state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listify = (s: string) =>
    s
      .split(/[\n,]/g)
      .map((x) => x.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client-side validation to save a round trip
    if (!title.trim()) return setError("Title is required.");
    if (!poster.trim()) return setError("Poster URL is required.");
    if (!trailer.trim()) return setError("Trailer URL is required.");
    if (!rating.trim()) return setError("Rating is required.");

    const payload: CreateMoviePayload = {
      title: title.trim(),
      poster: poster.trim(),
      trailer: trailer.trim(),
      rating,
      director: director || undefined,
      producer: producer || undefined,
      synopsis: synopsis || undefined,
      genres: listify(genresText),
      cast: listify(castText),
      reviews: listify(reviewsText),
    };

    try {
      setBusy(true);
      // duplicate showtime check removed; scheduling handled elsewhere
      await createMovie(payload);
      router.push("/system-admin");
    } catch (err: any) {
      setError(err?.message || "Failed to create movie.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Movie</h1>
        <button
          onClick={() => router.back()}
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Interstellar"
          />
        </div>

        {/* Poster + Trailer */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Poster URL *</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="https://…/poster.jpg"
            />
            {!!poster && (
              <div className="mt-2">
                {/* Preview (best-effort) */}
                <img
                  src={poster}
                  alt="Poster preview"
                  className="h-40 w-auto rounded border object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Trailer URL *</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={trailer}
              onChange={(e) => setTrailer(e.target.value)}
              placeholder="https://www.youtube.com/embed/…"
            />
          </div>
        </div>

        {/* Rating (release/upcoming removed) */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Rating *</label>
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="NR">NR</option>
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
            </select>
          </div>

          {/* Release date removed */}

          {/* Upcoming flag removed */}
        </div>

        {/* Director / Producer */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Director</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              placeholder="e.g., Denis Villeneuve"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Producer</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="e.g., Emma Thomas"
            />
          </div>
        </div>

        {/* Synopsis */}
        <div>
          <label className="block text-sm font-medium">Synopsis</label>
          <textarea
            className="mt-1 w-full rounded border px-3 py-2"
            rows={4}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Short description of the movie plot…"
          />
        </div>

        {/* Lists */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">
              Genres (comma/line)
            </label>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={2}
              value={genresText}
              onChange={(e) => setGenresText(e.target.value)}
              placeholder={`Action, Sci-Fi\nDrama`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Cast (comma/line)
            </label>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={2}
              value={castText}
              onChange={(e) => setCastText(e.target.value)}
              placeholder={`Actor One, Actor Two\nActor Three`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Reviews (comma/line)
            </label>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={2}
              value={reviewsText}
              onChange={(e) => setReviewsText(e.target.value)}
              placeholder={`"Amazing visuals", "Great score"`}
            />
          </div>
        </div>

        {/* Showtimes input removed; scheduling handled on schedule-movie page */}

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Create Movie"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/system-admin")}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
