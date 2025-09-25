import { useEffect, useState } from "react";
import axios from "axios";
import Movie from "@/models/movie";

const baseApiString = "http://localhost:8080/api/movies";

type MovieQueryParams = {
  id?: string;
  title?: string;
  genres?: string[];
};

type ErrorInfo = {
  status: number | null;
  message: string | null;
};

function getErrorMessage(status?: number): string {
  switch (status) {
    case 400:
      return "Bad request. Please check your input.";
    case 401:
      return "You need to log in to access this resource.";
    case 403:
      return "You do not have permission to view this content.";
    case 404:
      return "Movies not found.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Custom React hook for fetching movies from the API.
 *
 * @param params Optional query parameters to filter movies.
 *   Can include `id`, `title`, or `genres` to fetch specific movies.
 *
 * @returns An object containing:
 *   - `movies`: The list of fetched movies, or null if not yet loaded.
 *   - `loading`: True while the request is in progress.
 *   - `error`: Error information if the request failed, or null.
 *
 * @example
 * const { movies, loading, error } = useMovies({ title: "Inception", genres: ["Sci-Fi"] });
 *
 * if (loading) return <p>Loading movies...</p>;
 * if (error) return <p>Error: {error.message}</p>;
 *
 * return (
 *   <ul>
 *     {movies?.map(movie => (
 *       <li key={movie.id}>{movie.title}</li>
 *     ))}
 *   </ul>
 * );
 */
export function useMovies(params: MovieQueryParams = {}) {
  const loadingMovie = [
    {
      id: "-1",
      title: "Loading movie data..",
      poster: "/poster_loading.png",
      synopsis: "Skibidi Toilet Dubai Chocolate Labubu",
      trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      genres: ["Weeb", "Horror"],
      cast: ["Spongebob", "Patrick"],
      director: "John Cena",
      producer: "Danny Devito",
      reviews: ["Yes", "Cool"],
      rating: "NR",
      showtimes: [""],
      released: "2025-11-11",
      upcoming: false,
    },
  ];

  const [movies, setMovies] = useState<Movie[]>(loadingMovie);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | ErrorInfo>(null);

  useEffect(() => {
    const url = buildUrlString(params);

    setLoading(true);
    setError(null);

    axios
      .get<Movie | Movie[]>(url)
      .then((res) => {
        // If res.data is an array, use it; if single movie, wrap in array
        // console.log(res.data);
        const dataArray = Array.isArray(res.data)
          ? res.data
          : res.data
          ? [res.data]
          : [];
        setMovies(dataArray);
      })
      .catch((err) => setError(buildError(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.genres, params.id, params.title]);

  return { movies, loading, error };
}

function buildUrlString(params: MovieQueryParams): string {
  let query = baseApiString;

  if (params.id) {
    query += `/${params.id}`;
  } else {
    const searchParams = new URLSearchParams();
    if (params.title) searchParams.append("title", params.title);
    if (params.genres) searchParams.append("genres", params.genres.join(","));

    if ([...searchParams].length > 0) query += `?${searchParams.toString()}`;
  }

  return query;
}

function buildError(error: Error): ErrorInfo {
  if (!axios.isAxiosError(error))
    return { status: null, message: "Unexpected error" };

  if (!error.response)
    return {
      status: null,
      message: "Network error. Please check your connection",
    };

  const status = error.response.status;
  const message = error.response.data?.message;
  return {
    status: status,
    message: message || getErrorMessage(status),
  };
}
