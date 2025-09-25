import { useEffect, useState } from "react";
import axios from "axios";
import Movie from "@/models/movie";

const baseApiString = "http://localhost:8080/api/movies";

type MovieQueryParams = {
  id?: string;
  title?: string;
  genres?: string[]
}

type ErrorInfo = {
  status: number | null;
  message: string | null;
};

function getErrorMessage(status?: number): string {
  switch (status) {
    case 400: return "Bad request. Please check your input.";
    case 401: return "You need to log in to access this resource.";
    case 403: return "You do not have permission to view this content.";
    case 404: return "Movies not found.";
    case 500: return "Server error. Please try again later.";
    default:  return "Something went wrong. Please try again.";
  }
}

export function useMovies(params: MovieQueryParams = {}) {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | ErrorInfo>(null);

  useEffect(() => {
    const url = buildUrlString(params);

    setLoading(true);
    setError(null);

    axios.get<Movie[]>(url)
      .then(res => setMovies(res.data))
      .catch(err => setError(buildError(err)))
      .finally(() => setLoading(false))
  }, [params]);

    return {movies, loading, error};
}

function buildUrlString(params: MovieQueryParams): string {
  let query = baseApiString;

  if (params.id) {
    query += `/${params.id}`;
  } else {
    const searchParams = new URLSearchParams();
    if (params.title) searchParams.append("title", params.title);
    if (params.genres) searchParams.append("genres", params.genres.join(","));

    if ([...searchParams].length > 0) 
      query += `?${searchParams.toString}`;
  }

  return query;
}

function buildError(error: Error): ErrorInfo {
  if (!axios.isAxiosError(error))
    return {status: null, message: "Unexpected error"};

  if (!error.response)
    return {status: null, message: "Network error. Please check your connection"};

  const status = error.response.status;
  const message = error.response.data?.message;
  return {
    status: status,
    message: message || getErrorMessage(status)
  };
}
