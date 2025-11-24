import { Showroom, Showtime } from "@/models/shows";
import Movie from "@/models/movie";

const MOVIE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

function moviesOverlap(a: Date, b: Date): boolean {
  const startA = a.getTime();
  const endA = startA + MOVIE_DURATION_MS;

  const startB = b.getTime();
  const endB = startB + MOVIE_DURATION_MS;

  return startA < endB && startB < endA;
}

function moviesMatch(a: Movie, b: Movie): boolean {
  return a.title === b.title;
  // return a.id === b.id
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

/**
 * Retrieves all showtimes for a given movie across all showrooms.
 * @param movie - The movie object to search showtimes for
 * @returns An array of Showtime objects matching the provided movie
 */
export function getShowtimesForMovie(movie: Movie): Showtime[] {
  const showtimes: Showtime[] = [];

  for (const showroom of showroomsDb) {
    const filtered = showroom.showtimes.filter((showtime) =>
      moviesMatch(showtime.movie, movie)
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
    if (
      showroom.showtimes.some((showtime) => moviesMatch(showtime.movie, movie))
    )
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

  const newShowtime: Showtime = { movie, start: date, bookedSeats: [] };

  showroom.showtimes.push(newShowtime);

  return true;
}
