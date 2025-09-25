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
  showtimes: string[];
  released: string;
  upcoming: boolean;
}
