interface Movie {
    _id: string;
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
    isUpcoming: boolean;
};

export default Movie;