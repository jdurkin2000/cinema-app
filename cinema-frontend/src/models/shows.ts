export interface Showroom {
    id: string;
    showtimes: Showtime[];
}

export interface Showtime {
    movieId: string;
    start: Date;
    bookedSeats: string[];
    roomId: string;
}