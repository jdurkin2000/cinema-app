import { Showroom, Showtime } from "@/models/shows";
import Movie from "@/models/movie";
import axios from "axios";

const MOVIE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours
const SHOWROOMS_API = "http://localhost:8080/api/showrooms";
const MOVIES_API = "http://localhost:8080/api/movies";

function moviesOverlap(a: Date, b: Date): boolean {
  const startA = a.getTime();
  const endA = startA + MOVIE_DURATION_MS;

  const startB = b.getTime();
  const endB = startB + MOVIE_DURATION_MS;

  return startA < endB && startB < endA;
}

const showroomsDb: Showroom[] = [
  {
    id: "a",
    showtimes: [],
  },
  {
    id: "b",
    showtimes: [],
  },
  {
    id: "c",
    showtimes: [],
  },
];

export async function createShowroom(showroom: Showroom): Promise<Showroom> {
  // Convert Date objects to ISO strings since JSON cannot send Date objects
  const payload = {
    ...showroom,
    showtimes: showroom.showtimes.map((st) => ({
      ...st,
      start: st.start instanceof Date ? st.start.toISOString() : st.start,
    })),
  };

  const response = await axios.post<Showroom>("/api/showrooms", payload);
  return response.data;
}

/**
 * Retrieves all showtimes for a given movie across all showrooms.
 * @param movie - The movie object to search showtimes for
 * @returns An array of Showtime objects matching the provided movie
 */
export function getShowtimesForMovie(movie: Movie): Showtime[] {
  const showtimes: Showtime[] = [];

  for (const showroom of showroomsDb) {
    const filtered = showroom.showtimes.filter(
      (showtime) => showtime.movieId === movie.id
    );
    showtimes.push(...filtered);
  }

  return showtimes;
}

/**
 * Determines whether a given movie is scheduled in any showroom.
 *
 * Iterates through the global `showroomsDb` and checks each showroom's
 * `showtimes` to see if any showtime's movie matches the provided `movie`
 * according to the `moviesMatch` comparison function. The search short-circuits
 * and returns `true` on the first match found.
 *
 * @param movie - The movie to look for among all showtimes.
 * @returns `true` if the movie is scheduled in at least one showroom; otherwise `false`.
 *
 * @remarks
 * - Relies on the external `showroomsDb` data source and the `moviesMatch` helper.
 * - This function has no side effects and does not modify `showroomsDb`.
 */
export function isMovieShowing(movie: Movie): boolean {
  for (const showroom of showroomsDb) {
    if (showroom.showtimes.some((showtime) => showtime.movieId === movie.id))
      return true;
  }

  return false;
}

/**
 * Schedule a movie showing in a showroom.
 *
 * Attempts to add a new showtime for the given movie at the specified start date/time
 * into the showroom identified by `showroomId`. If `showroomId` is not provided or no
 * matching showroom is found, the first showroom in `showroomsDb` is used as the target.
 *
 * The function will first check whether the requested start time overlaps with any
 * existing showtime in the chosen showroom using `moviesOverlap`. If an overlap is
 * detected, no changes are made and the function returns `false`. Otherwise a new
 * showtime object with an empty `bookedSeats` array is appended to the showroom's
 * `showtimes` and the function returns `true`.
 *
 * Side effects:
 * - Mutates the global `showroomsDb` by pushing a new showtime into a showroom's
 *   `showtimes` array.
 *
 * Notes and caveats:
 * - `date` is expected to be a valid `Date` object representing the show start time.
 * - If `showroomsDb` is empty (so `showroomsDb[0]` is `undefined`), accessing
 *   `showroom.showtimes` will throw; callers should ensure at least one showroom exists.
 * - This function is not concurrency-safe; concurrent calls may result in race conditions.
 *
 * @param movie - The movie to schedule.
 * @param date - The start date/time for the show.
 * @param showroomId - Optional showroom identifier; if omitted or not found, the first showroom is used.
 * @returns `true` if the showtime was successfully scheduled; `false` if it conflicts with an existing showtime.
 *
 * @example
 * // Schedule a movie in the default showroom:
 * scheduleMovie(myMovie, new Date('2025-12-01T19:30:00'));
 *
 * @example
 * // Schedule a movie in a specific showroom:
 * scheduleMovie(myMovie, new Date('2025-12-01T19:30:00'), 'showroom-123');
 */
export function scheduleMovie(
  movie: Movie,
  date: Date,
  showroomId?: string
): boolean {
  const showroom =
    showroomsDb.find((showroom) => showroom.id === showroomId) ??
    showroomsDb[0];

  if (
    showroom.showtimes.some((showtime) => moviesOverlap(date, showtime.start))
  ) {
    return false;
  }

  const newShowtime: Showtime = {
    movieId: movie.id,
    start: date,
    bookedSeats: [],
  };

  showroom.showtimes.push(newShowtime);

  return true;
}

export function scheduleMovieWithShowroom(
  movie: Movie,
  date: Date,
  showroom: Showroom
): boolean {
  if (
    showroom.showtimes.some((showtime) => moviesOverlap(date, showtime.start))
  ) {
    return false;
  }

  const newShowtime: Showtime = {
    movieId: movie.id,
    start: date,
    bookedSeats: [],
  };

  showroom.showtimes.push(newShowtime);

  return true;
}

/**
 * Fetches all showrooms and extracts unique movie IDs that are currently scheduled.
 * @returns An array of unique movie IDs from all showrooms' showtimes
 */
export async function getMovieIdsFromShowrooms(): Promise<string[]> {
  try {
    const response = await axios.get<Showroom[]>(SHOWROOMS_API);
    const movieIds = new Set<string>();

    response.data.forEach((showroom) => {
      showroom.showtimes?.forEach((showtime) => {
        if (showtime.movieId) {
          movieIds.add(showtime.movieId);
        }
      });
    });

    return Array.from(movieIds);
  } catch (error) {
    console.error("Error fetching showrooms:", error);
    return [];
  }
}

/**
 * Fetches all movies scheduled in showrooms and categorizes them as "Now Showing" or "Upcoming"
 * based on their showtime dates (not the static isUpcoming flag).
 * @returns An object with arrays of now showing and upcoming movies
 */
export async function getShowroomMovies(): Promise<{
  nowShowing: Movie[];
  upcoming: Movie[];
}> {
  try {
    // Get all showrooms with their showtimes
    const showroomsResponse = await axios.get<Showroom[]>(SHOWROOMS_API);
    const showrooms = showroomsResponse.data;

    // Collect all unique movie IDs and their earliest showtime
    const movieShowtimes = new Map<string, Date>();

    showrooms.forEach((showroom) => {
      showroom.showtimes?.forEach((showtime) => {
        if (showtime.movieId) {
          const startDate = new Date(showtime.start);
          const existing = movieShowtimes.get(showtime.movieId);

          // Keep the earliest showtime for each movie
          if (!existing || startDate < existing) {
            movieShowtimes.set(showtime.movieId, startDate);
          }
        }
      });
    });

    if (movieShowtimes.size === 0) {
      return { nowShowing: [], upcoming: [] };
    }

    // Fetch all movies from the backend
    const allMoviesResponse = await axios.get<Movie[]>(MOVIES_API);
    const allMovies = allMoviesResponse.data;

    // Filter to only movies scheduled in showrooms
    const scheduledMovies = allMovies.filter((movie) =>
      movieShowtimes.has(movie.id)
    );

    // Categorize based on showtime date vs today
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today

    const nowShowing: Movie[] = [];
    const upcoming: Movie[] = [];

    scheduledMovies.forEach((movie) => {
      const showtime = movieShowtimes.get(movie.id);
      if (showtime) {
        const showtimeDate = new Date(showtime);
        showtimeDate.setHours(0, 0, 0, 0); // Set to start of showtime date

        if (showtimeDate <= now) {
          nowShowing.push(movie);
        } else {
          upcoming.push(movie);
        }
      }
    });

    return { nowShowing, upcoming };
  } catch (error) {
    console.error("Error fetching showroom movies:", error);
    return { nowShowing: [], upcoming: [] };
  }
}

/**
 * Fetches currently running movies that are scheduled in showrooms.
 * @returns An array of currently running Movie objects scheduled in showrooms
 */
export async function getCurrentlyShowingMovies(): Promise<Movie[]> {
  const { nowShowing } = await getShowroomMovies();
  return nowShowing;
}

/**
 * Fetches upcoming movies that are scheduled in showrooms.
 * @returns An array of upcoming Movie objects scheduled in showrooms
 */
export async function getUpcomingShowingMovies(): Promise<Movie[]> {
  const { upcoming } = await getShowroomMovies();
  return upcoming;
}
