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

export function isMovieShowing(movie: Movie): boolean {
  for (const showroom of showroomsDb) {
    if (
      showroom.showtimes.some((showtime) => moviesMatch(showtime.movie, movie))
    )
      return true;
  }

  return false;
}

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

  const newShowtime: Showtime = { movie, start: date };

  showroom.showtimes.push(newShowtime);

  return true;
}
