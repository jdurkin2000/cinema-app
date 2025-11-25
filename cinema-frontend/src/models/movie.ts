/**
 * Movie model - matches backend MovieItem.
 *
 * Note: showtimes, released, and upcoming fields have been removed.
 * Use the Showtime/Showroom subsystem to manage showtimes.
 */
export default interface Movie {
  id: string;
  title: string;
  genres: string[];
  cast: string[];
  director: string;
  producer: string;
  synopsis: string;
  reviews: string[];
  poster: string;
  trailer: string;
  rating: string;
}
