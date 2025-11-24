"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getMovie,
  updateMovie,
  getShowrooms,
  CreateMoviePayload,
  Showroom, // <-- Importing Showroom type from cinemaApi.ts
} from "@/libs/cinemaApi";
import Movie from "@/models/movie"; // <-- IMPORTANT: Importing Movie model type


// --- REMOVED: Local MovieItem interface to avoid type conflict ---
// --- REMOVED: Local Showroom interface ---

// Local state for managing showtimes + showrooms (Still needed for frontend logic)
interface ShowtimeEntry {
  id: number;
  time: string; // ISO string: 2025-12-01T19:30
  showroomName: string; // Used for display and identification
}

/**
 * Admin / Edit Movie
 * - Loads existing movie data and available showrooms.
 * - Allows all fields to be edited.
 * - Manages showtimes as structured entries (time + showroom).
 */
export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id as string;

  // --- 1. Master Movie Data State ---
  // Changed state type from Partial<MovieItem> to Partial<Movie> (imported from @/models/movie)
  const [movieData, setMovieData] = useState<Partial<Movie>>({});

  // --- 2. Showroom/Showtime State ---
  // Using the imported Showroom type
  const [allShowrooms, setAllShowrooms] = useState<Showroom[]>([]);
  const [currentShowtimes, setCurrentShowtimes] = useState<ShowtimeEntry[]>([]);
  // Note: Adding new showtimes is disabled on this page.

  // --- 3. List Text Inputs ---
  const [genresText, setGenresText] = useState("");
  const [castText, setCastText] = useState("");
  const [reviewsText, setReviewsText] = useState("");

  // --- 4. UX State ---
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // --- Data Fetching ---
  useEffect(() => {
    async function fetchData() {
      if (!movieId) {
        setError("Movie ID is missing.");
        return;
      }
      try {
        // Fetch movie and showrooms concurrently
        const [movieResponse, showroomsResponse] = await Promise.all([
          getMovie(movieId),
          getShowrooms(),
        ]);

        // This is now compatible: Movie -> Partial<Movie>
        setMovieData(movieResponse);
        setAllShowrooms(showroomsResponse);

        // Map existing list fields to textareas
        // Note: The movieResponse properties are accessed directly from the imported Movie type
        setGenresText(movieResponse.genres?.join(", ") || "");
        setCastText(movieResponse.cast?.join(", ") || "");
        setReviewsText(movieResponse.reviews?.join(", ") || "");

        // Map existing showtimes (which are now Date objects due to dateReviver) to structured entries
        setCurrentShowtimes(
          (movieResponse.showtimes || []).map((time: string | Date, index: number) => {
            // Convert Date object back to ISO string if necessary
            const timeString = time instanceof Date ? time.toISOString() : time;

            return {
              id: index + 1,
              // Truncate to YYYY-MM-DDTHH:MM format required by datetime-local input
              time: timeString.substring(0, 16),
              showroomName: "Existing Showtime", // Placeholder label for existing times
            };
          })
        );

        // ...existing initialization complete

        setLoaded(true);
      } catch (err: any) {
        setError(err?.message || "Failed to load movie or showrooms.");
        setLoaded(true);
      }
    }

    fetchData();
  }, [movieId]);

  // --- Helper Functions ---
  const listify = (s: string) =>
    s
      .split(/[\n,]/g)
      .map((x) => x.trim())
      .filter(Boolean);

  // Changed field type from keyof MovieItem to keyof Movie
  const handleInputChange = (field: keyof Movie, value: any) => {
    setMovieData((prev) => ({ ...prev, [field]: value }));
  };

  // Adding new showtimes has been removed from this page.

  const removeShowtimeEntry = (id: number) => {
    setCurrentShowtimes(currentShowtimes.filter((st) => st.id !== id));
  };

  // --- Submit Handler (Update Logic) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!movieData.title?.trim()) return setError("Title is required.");
    // Add other required field validations here...

    // The backend expects ONLY the array of ISO time strings for showtimes.
    // Flatten the structured currentShowtimes back into a string array.
    const allTimes = currentShowtimes.map((st) => st.time);

    // Prepare the released date for the payload (which expects Date | string)
    // movieData.released is already a Date object (if loaded) or string.
    let releasedDate;
    if (movieData.released) {
      // If it was loaded as a Date (from the API), use that Date object.
      if (movieData.released instanceof Date) {
        releasedDate = movieData.released;
      } else if (typeof movieData.released === 'string') {
        // If the input field changed it to a date string, convert it to Date
        releasedDate = new Date(movieData.released);
      }
    }


    const payload: CreateMoviePayload = {
      title: movieData.title?.trim() || "",
      poster: movieData.poster?.trim() || "",
      trailer: movieData.trailer?.trim() || "",
      rating: movieData.rating || "NR",
      director: movieData.director || undefined,
      producer: movieData.producer || undefined,
      synopsis: movieData.synopsis || undefined,
      genres: listify(genresText),
      cast: listify(castText),
      reviews: listify(reviewsText),
      // Sending flattened list of time strings
      showtimes: allTimes,
      released: releasedDate,
      upcoming: movieData.upcoming ?? true,
    };

    try {
      setBusy(true);
      // Call the API function mapped to PUT /api/movies/{id}
      await updateMovie(movieId, payload);
      router.push("/system-admin");
    } catch (err: any) {
      setError(err?.message || "Failed to update movie.");
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Loading Movie... ⏳</h1>
      </main>
    );
  }

  if (error && !movieData.title) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          Back
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Edit Movie: {movieData.title}</h1>
        <button
          onClick={() => router.back()}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition"
        >
          Back to Admin
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* --- Primary Details --- */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={movieData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Movie Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rating *</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={movieData.rating || "NR"}
              onChange={(e) => handleInputChange("rating", e.target.value)}
            >
              <option value="NR">NR</option>
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
            </select>
          </div>
        </div>

        {/* Poster + Trailer */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Poster URL *</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              value={movieData.poster || ""}
              onChange={(e) => handleInputChange("poster", e.target.value)}
              placeholder="https://…/poster.jpg"
            />
            {!!movieData.poster && (
              <div className="mt-3">
                <img
                  src={movieData.poster}
                  alt="Poster preview"
                  className="h-40 w-auto rounded-md border object-cover"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trailer URL *</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              value={movieData.trailer || ""}
              onChange={(e) => handleInputChange("trailer", e.target.value)}
              placeholder="https://www.youtube.com/embed/…"
            />
          </div>
        </div>

        {/* Release + Upcoming */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Release Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              // CORRECTED VALUE ASSIGNMENT:
              value={
                movieData.released
                  ? movieData.released instanceof Date
                    ? movieData.released.toISOString().substring(0, 10) // Format Date object
                    : (movieData.released as string).substring(0, 10)   // Format string (e.g., from initial load)
                  : "" // Fallback to empty string if undefined/null
              }
              onChange={(e) => handleInputChange("released", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="upcoming"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={movieData.upcoming ?? true}
              onChange={(e) => handleInputChange("upcoming", e.target.checked)}
            />
            <label htmlFor="upcoming" className="text-sm font-medium text-gray-700">
              Is Upcoming?
            </label>
          </div>
        </div>

        {/* Synopsis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Synopsis</label>
          <textarea
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
            rows={4}
            value={movieData.synopsis || ""}
            onChange={(e) => handleInputChange("synopsis", e.target.value)}
            placeholder="Short description of the movie plot…"
          />
        </div>

        {/* Director / Producer */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Director</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              value={movieData.director || ""}
              onChange={(e) => handleInputChange("director", e.target.value)}
              placeholder="e.g., Denis Villeneuve"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Producer</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              value={movieData.producer || ""}
              onChange={(e) => handleInputChange("producer", e.target.value)}
              placeholder="e.g., Emma Thomas"
            />
          </div>
        </div>

        {/* --- List Inputs --- */}
        <h2 className="text-xl font-semibold pt-4 border-t mt-6">Lists (Genres, Cast, Reviews)</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Genres (comma/line)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              rows={3}
              value={genresText}
              onChange={(e) => setGenresText(e.target.value)}
              placeholder={`Action, Sci-Fi\nDrama`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cast (comma/line)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              rows={3}
              value={castText}
              onChange={(e) => setCastText(e.target.value)}
              placeholder={`Actor One, Actor Two\nActor Three`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reviews (comma/line)
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
              rows={3}
              value={reviewsText}
              onChange={(e) => setReviewsText(e.target.value)}
              placeholder={`"Amazing visuals", "Great score"`}
            />
          </div>
        </div>

        {/* --- Showtime / Showroom Management --- */}
        <h2 className="text-xl font-semibold pt-4 border-t mt-6">Showtimes & Showrooms 📅</h2>
        <div className="space-y-4 border border-gray-200 p-5 rounded-lg bg-gray-50">

          {/* List of Current Showtimes */}
          <div className="text-sm space-y-2">
            <p className="font-semibold text-gray-700">Scheduled Showings:</p>
            {currentShowtimes.length === 0 ? (
              <p className="text-gray-500 italic">No showtimes scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {currentShowtimes.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex justify-between items-center bg-white p-3 border rounded-md shadow-sm"
                  >
                    <span className="font-medium">
                      {entry.time.replace("T", " at ")}
                    </span>
                    <span className="text-xs text-gray-600 italic">
                      ({entry.showroomName})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeShowtimeEntry(entry.id)}
                      className="text-red-600 hover:text-red-800 text-xs ml-4 font-medium"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Adding new showtimes removed: use the Schedule Movie page to create showtimes. */}
        </div>


        {/* --- Actions --- */}
        <div className="pt-4 flex items-center gap-3 border-t">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {busy ? "Updating…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/system-admin")}
            className="rounded-md border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}