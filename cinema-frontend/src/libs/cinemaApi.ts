import { useEffect, useState } from "react";
import axios from "axios";
import Movie from "@/models/movie";
import Error from "next/error";

const baseApiString = "http://localhost:8080/api/movies";

/**
 * Represents the query parameters used to filter movies in the cinema API.
 *
 * @property id - Optional unique identifier of the movie.
 * @property title - Optional title of the movie to search for.
 * @property genres - Optional array of genres to filter movies by.
 */
export type MovieQueryParams = {
  id?: string;
  title?: string;
  genres?: string[];
};

type ErrorInfo = {
  status: number | null;
  message: string;
};

export type Status = {
  message: string;
  currentState: "Loading" | "Success" | "Not Found" | "Error";
};

export function getErrorMessage(status?: number): string {
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

// Regex to detect ISO 8601 UTC timestamps
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z)?$/;

// Reviver function that converts ISO strings to Date
function dateReviver(key: string, value: unknown) {
  if (typeof value === "string" && isoDateRegex.test(value)) {
    return new Date(value);
  }
  if (Array.isArray(value)) {
    return value.map((v) =>
      typeof v === "string" && isoDateRegex.test(v) ? new Date(v) : v
    );
  }
  return value;
}

/**
 * Custom React hook to fetch movie data from the backend API using the provided query parameters.
 *
 * The hook:
 * - initializes a temporary "loading" movie item while the request is in flight,
 * - issues an HTTP GET request (via axios) with a JSON date reviver,
 * - accepts either a single Movie or an array of Movie objects from the server and normalizes
 *   the response to an array,
 * - updates an AsyncState status value to reflect Loading, Success, NotFound (404) or Error,
 * - re-runs when params.genres, params.id or params.title change.
 *
 * @param params - Optional MovieQueryParams object used to build the request URL (defaults to {}).
 *                 Typical keys include id, title, genres, etc. Only the listed dependencies
 *                 (params.genres, params.id, params.title) are watched by the effect.
 *
 * @returns An object containing:
 *   - movies: Movie[] - the fetched movie records (or a single movie wrapped in an array).
 *   - status: AsyncState - the current async lifecycle state (Loading | Success | NotFound | Error).
 *
 * @remarks
 * - Before the request completes the hook exposes a single "loading" Movie placeholder in the movies array.
 * - The response is parsed with a dateReviver so any serialized date fields are restored to Date objects.
 * - If the network/client error indicates HTTP 404, the hook sets status to AsyncState.NotFound; otherwise it sets AsyncState.Error.
 * - The hook intentionally disables exhaustive-deps linting and only depends on params.genres, params.id and params.title.
 *
 * @example
 * // Fetch horror movies
 * const { movies, status } = useMovies({ genres: ["Horror"] });
 */
export function useMovies(params: MovieQueryParams = {}) {
  const loadingMovie: Movie[] = [
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
      showtimes: [],
      released: new Date(),
      upcoming: false,
    },
  ];

  const [movies, setMovies] = useState<Movie[]>(loadingMovie);
  const [status, setStatus] = useState<Status>({
    currentState: "Loading",
    message: "Requesting Movies",
  });

  useEffect(() => {
    const url = buildUrlString(params);

    setStatus({ currentState: "Loading", message: "Requesting Movies" });

    axios
      .get<Movie | Movie[]>(url, {
        transformResponse: [(data) => (data ? JSON.parse(data, dateReviver) : null)],
      })
      .then((res) => {
        // If res.data is an array, use it; if single movie, wrap in array
        // console.log(res.data);
        const dataArray = Array.isArray(res.data)
          ? res.data
          : res.data
          ? [res.data]
          : [];
          
        if (dataArray.length === 0) {
          setStatus({ currentState: "Not Found", message: "Movies not found." });
          return;
        }

        setMovies(dataArray);
        setStatus({
          currentState: "Success",
          message: "Succesfully Fetched Movies",
        });
      })
      .catch((err) => {
        console.log("Caught error:", err);
        const parsedError = buildError(err);
        const newState = parsedError.status == 404 ? "Not Found" : "Error";
        const newStatus: Status = {
          currentState: newState,
          message: parsedError.message,
        };
        setStatus(newStatus);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.genres, params.id, params.title]);

  return { movies, status };
}

/**
 * Formats a JavaScript `Date` object into a localized string using US English conventions.
 *
 * The output includes both the date and time in short format.
 *
 * @param date - The `Date` object to format.
 * @returns A string representing the formatted date and time.
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

// ------- Create Movie (Admin) -------

export type CreateMoviePayload = {
  title: string;
  poster: string;
  trailer: string;
  rating: string; // "G" | "PG" | "PG-13" | "R" | "NC-17" | "NR"
  genres?: string[];
  cast?: string[];
  director?: string;
  producer?: string;
  synopsis?: string;
  reviews?: string[];
  showtimes?: (string | Date)[];
  released?: string | Date;
  upcoming?: boolean;
};

/**
 * Create a new movie (Admin only).
 * Pass a JWT via opts.token or ensure it's in localStorage as "authToken".
 */
export async function createMovie(
  payload: CreateMoviePayload,
  opts?: { token?: string }
): Promise<Movie> {
  try {
    // Normalize dates to ISO strings so Spring can parse LocalDate/LocalDateTime
    const toIso = (v: unknown) =>
      v instanceof Date ? v.toISOString() : typeof v === "string" ? v : undefined;

    const body = {
      ...payload,
      released: payload.released ? toIso(payload.released) : undefined,
      showtimes: payload.showtimes?.map(toIso).filter(Boolean),
    };

    // Prefer explicit token, fallback to localStorage (client-side)
    const token =
      opts?.token ??
      (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

    const res = await axios.post<Movie>(baseApiString, body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      transformResponse: [
        (data) => (data ? JSON.parse(data, dateReviver) : null),
      ],
    });

    return res.data;
  } catch (err: any) {
    // build the error info
    const info = buildError(err);

    // ✅ use native Error types without colliding with next/error
    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;

  }
}
