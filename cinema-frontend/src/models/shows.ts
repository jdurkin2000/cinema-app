/**
 * Showroom and Showtime models - match backend.
 *
 * Dates are stored as Instant (UTC) in backend and sent as ISO-8601 strings.
 * Frontend should convert to Date objects for manipulation.
 */
export interface Showroom {
  id: string;
  showtimes: Showtime[];
}

export interface Showtime {
  movieId: string;
  start: string; // ISO-8601 string from backend
  bookedSeats: string[];
  roomId: string;
}
