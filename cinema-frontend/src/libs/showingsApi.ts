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

export async function createShowroom(showroom: Showroom): Promise<Showroom> {
  // Convert Date objects to ISO strings so backend parses them correctly
  const payload = {
    ...showroom,
    showtimes: showroom.showtimes?.map((st) => ({
      ...st,
      start: st.start instanceof Date ? st.start.toISOString() : st.start,
    })),
  };

  const response = await axios.post<Showroom>(SHOWROOMS_API, payload);
  return response.data;
}

/**
 * Retrieves all showtimes for a given movie across all showrooms.
 * @param movie - The movie object to search showtimes for
 * @returns An array of Showtime objects matching the provided movie
 */
/**
 * Fetch showrooms from backend and return all showtimes for the given movie.
 */
export async function getShowtimesForMovie(movie: Movie): Promise<Showtime[]> {
  try {
    const res = await axios.get<Showroom[]>(SHOWROOMS_API);
    const result: Showtime[] = [];
    res.data.forEach((showroom) => {
      showroom.showtimes?.forEach((st) => {
        if (st.movieId === movie.id) {
          // Ensure `start` is a Date on the client
          const converted: Showtime = {
            ...st,
            start:
              st.start instanceof Date ? st.start : new Date(String(st.start)),
          };
          result.push(converted);
        }
      });
    });
    return result;
  } catch (err) {
    console.error("Error fetching showtimes for movie:", err);
    return [];
  }
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
/**
 * Returns true if the movie has at least one showroom showtime on the server.
 */
export async function isMovieShowing(movie: Movie): Promise<boolean> {
  try {
    const res = await axios.get<Showroom[]>(SHOWROOMS_API);
    for (const showroom of res.data) {
      if (showroom.showtimes?.some((st) => st.movieId === movie.id))
        return true;
    }
    return false;
  } catch (err) {
    console.error("Error checking if movie is showing:", err);
    return false;
  }
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
/**
 * Schedule a movie by adding a showtime to a showroom on the backend.
 * Returns true on success, false on conflict/error.
 */
export async function scheduleMovie(
  movie: Movie,
  date: Date,
  showroomId?: string
): Promise<boolean> {
  try {
    // If showroomId provided, post to that showroom's showtimes endpoint
    const payload = {
      movieId: movie.id,
      start: date.toISOString(),
      bookedSeats: [],
    };

    if (showroomId) {
      await axios.post<Showroom>(
        `${SHOWROOMS_API}/${showroomId}/showtimes`,
        payload
      );
      return true;
    }

    // No showroomId: pick a showroom by fetching list and choosing first that has no overlap
    const res = await axios.get<Showroom[]>(SHOWROOMS_API);
    for (const showroom of res.data) {
      // check overlap by fetching its showtimes
      const hasOverlap = showroom.showtimes?.some((st) =>
        moviesOverlap(new Date(String(st.start)), date)
      );
      if (!hasOverlap) {
        await axios.post<Showroom>(
          `${SHOWROOMS_API}/${showroom.id}/showtimes`,
          payload
        );
        return true;
      }
    }

    // no showroom free
    return false;
  } catch (err) {
    console.error("Error scheduling movie:", err);
    return false;
  }
}

export async function scheduleMovieWithShowroom(
  movie: Movie,
  date: Date,
  showroom: Showroom
): Promise<boolean> {
  try {
    // Reuse backend endpoint for adding showtime to a specific showroom
    const payload = {
      movieId: movie.id,
      start: date.toISOString(),
      bookedSeats: [],
    };
    await axios.post<Showroom>(
      `${SHOWROOMS_API}/${showroom.id}/showtimes`,
      payload
    );
    return true;
  } catch (err) {
    console.error("Error scheduling movie with showroom:", err);
    return false;
  }
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

    // Build a set of movie IDs that have at least one scheduled showtime
    const scheduledMovieIds = new Set<string>();
    showrooms.forEach((showroom) => {
      showroom.showtimes?.forEach((showtime) => {
        if (showtime.movieId) scheduledMovieIds.add(showtime.movieId);
      });
    });

    // Fetch all movies from the backend
    const allMoviesResponse = await axios.get<Movie[]>(MOVIES_API);
    const allMovies = allMoviesResponse.data;

    // Now: any movie that is scheduled in a showroom is "Now Showing".
    // All other movies (no scheduled showtime in any showroom) are considered "Upcoming".
    const nowShowing = allMovies.filter((m) => scheduledMovieIds.has(m.id));
    const upcoming = allMovies.filter((m) => !scheduledMovieIds.has(m.id));

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
