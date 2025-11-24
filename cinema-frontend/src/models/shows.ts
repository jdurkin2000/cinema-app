import Movie from "./movie";

export interface Showroom {
    id: string;
    showtimes: Showtime[];
}

export interface Showtime {
    movie: Movie;
    start: Date;
    bookedSeats: string[];
}