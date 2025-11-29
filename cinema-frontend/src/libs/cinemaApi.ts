import { useEffect, useState } from "react";
import axios from "axios";
import Movie from "@/models/movie";
import { dateReviver, formatDateTime } from "@/utils/dateTimeUtil";
import { Showroom as ShowroomModel } from "@/models/shows";
import { getToken } from "@/libs/authStore";

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

// Note: dateReviver moved to @/utils/dateTimeUtil for centralized date handling

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
      synopsis: "Loading...",
      trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      genres: ["Loading"],
      cast: ["Loading"],
      director: "Loading",
      producer: "Loading",
      reviews: ["Loading"],
      rating: "NR",
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
        transformResponse: [
          (data) => (data ? JSON.parse(data, dateReviver) : null),
        ],
      })
      .then(async (res) => {
        // If res.data is an array, use it; if single movie, wrap in array
        // console.log(res.data);
        const dataArray = Array.isArray(res.data)
          ? res.data
          : res.data
          ? [res.data]
          : [];

        // If no movies returned, fetch upcoming (independent of showrooms)
        if (dataArray.length === 0) {
          try {
            const upcoming = await axios.get<Movie[]>(
              `${baseApiString}/upcoming`,
              {
                transformResponse: [
                  (data) => (data ? JSON.parse(data, dateReviver) : null),
                ],
              }
            );
            const up = Array.isArray(upcoming.data) ? upcoming.data : [];
            if (up.length > 0) {
              setMovies(up);
              setStatus({
                currentState: "Success",
                message: "Loaded upcoming movies",
              });
              return;
            }
          } catch (e) {
            // fall through to not found/error
          }
          setStatus({
            currentState: "Not Found",
            message: "Movies not found.",
          });
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

// Note: formatDateTime moved to @/utils/dateTimeUtil for centralized date handling

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

function buildError(error: unknown): ErrorInfo {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data as { message?: string } | undefined;
    const msg = data?.message;
    return { status, message: msg || getErrorMessage(status ?? undefined) };
  }
  if (error instanceof Error) {
    return { status: null, message: error.message };
  }
  return { status: null, message: "Unexpected error" };
}

// ------- Create Movie (Admin) -------

/**
 * Movie creation payload - matches backend MovieDtos.CreateRequest
 * Note: showtimes, released, and upcoming fields removed (managed via Showtime/Showroom subsystem)
 */
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
};

/**
 * Create a new movie (Admin only).
 * Pass a JWT via opts.token or ensure it's in localStorage as "authToken".
 *
 * Note: To schedule showtimes for this movie, use the showrooms API after creation.
 */
export async function createMovie(
  payload: CreateMoviePayload,
  opts?: { token?: string }
): Promise<Movie> {
  try {
    // Prefer explicit token, fallback to localStorage (client-side)
    const token =
      opts?.token ?? (typeof window !== "undefined" ? getToken() : null);

    const res = await axios.post<Movie>(baseApiString, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      transformResponse: [
        (data) => (data ? JSON.parse(data, dateReviver) : null),
      ],
    });

    return res.data;
  } catch (err: unknown) {
    // build the error info
    const info = buildError(err);

    // ✅ use native Error types without colliding with next/error
    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

// ------- Promotions (Admin) -------

export type Promotion = {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  discountPercent: number;
};

export type CreatePromotionPayload = {
  code: string;
  startDate: string; // "yyyy-mm-dd"
  endDate: string; // "yyyy-mm-dd"
  discountPercent: number;
};

const promoApiBase = "http://localhost:8080/api/promotions";

/**
 * Fetch all promotions (requires authentication)
 */
export async function getPromotions(opts?: { token?: string }) {
  try {
    const token =
      opts?.token ?? (typeof window !== "undefined" ? getToken() : null);

    const res = await axios.get<Promotion[]>(promoApiBase, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return res.data;
  } catch (err: unknown) {
    // If no promotions exist the backend returns 404 — treat that as empty list
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return [];
    }
    const info = buildError(err);
    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

/**
 * Create a new promotion (Admin only).
 * Validates on the backend: code, dates, discount%.
 */
export async function createPromotion(
  payload: CreatePromotionPayload,
  opts?: { token?: string }
): Promise<Promotion> {
  try {
    // Prefer explicit token, fallback to localStorage (client-side)
    const token =
      opts?.token ?? (typeof window !== "undefined" ? getToken() : null);

    const res = await axios.post<Promotion>(promoApiBase, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return res.data;
  } catch (err: unknown) {
    const info = buildError(err);

    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

/**
 * Send an existing promotion to subscribed users only.
 */
export async function sendPromotion(
  promotionId: string,
  opts?: { token?: string }
): Promise<{ promotionId: string; emailsSent: number }> {
  try {
    const token =
      opts?.token ?? (typeof window !== "undefined" ? getToken() : null);

    const res = await axios.post<{ promotionId: string; emailsSent: number }>(
      `${promoApiBase}/${promotionId}/send`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    return res.data;
  } catch (err: unknown) {
    const info = buildError(err);

    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

// ------- Showrooms -------

// legacy Showroom interface removed; using ShowroomModel instead
export type Showroom = ShowroomModel;
// removed stray catch lines that were outside any try block
// removed stray catch lines that were outside any try block
// removed stray catch lines that were outside any try block
// removed stray catch lines that were outside any try block
// removed stray catch lines that were outside any try block

const showroomApiBase = "http://localhost:8080/api/showrooms";

/**
 * Fetch all showrooms.
 */
export async function getShowrooms(): Promise<Showroom[]> {
  try {
    const res = await axios.get<Showroom[]>(showroomApiBase);
    return res.data;
  } catch (err: unknown) {
    console.error("Error fetching showrooms:", err);
    return [];
  }
}

/**
 * Delete a showtime from a showroom (Admin only).
 * Payload: { movieId: string, start: string }
 */
export async function deleteShowtimeFromShowroom(
  showroomId: string,
  payload: { movieId: string; start: string },
  opts?: { token?: string }
): Promise<void> {
  try {
    const token =
      opts?.token ?? (typeof window !== "undefined" ? getToken() : null);

    await axios.delete(`${showroomApiBase}/${showroomId}/showtimes`, {
      data: payload,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (err: unknown) {
    const info = buildError(err);
    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

// ------- Movie Admin (Get, Update) -------

/**
 * Fetch a single movie by ID.
 */
export async function getMovie(movieId: string): Promise<Movie> {
  try {
    const res = await axios.get<Movie>(`${baseApiString}/${movieId}`, {
      transformResponse: [
        (data) => (data ? JSON.parse(data, dateReviver) : null),
      ],
    });
    return res.data;
  } catch (err: unknown) {
    const info = buildError(err);
    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

/**
 * Update an existing movie (Admin only).
 *
 * Note: To update showtimes, use the showrooms API directly.
 */
export async function updateMovie(
  movieId: string,
  payload: CreateMoviePayload,
  opts?: { token?: string }
): Promise<Movie> {
  try {
    const token =
      opts?.token ?? (typeof window !== "undefined" ? getToken() : null);

    const res = await axios.put<Movie>(`${baseApiString}/${movieId}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      transformResponse: [
        (data) => (data ? JSON.parse(data, dateReviver) : null),
      ],
    });

    return res.data;
  } catch (err: unknown) {
    const info = buildError(err);
    type JsError = InstanceType<typeof globalThis.Error>;
    const e: JsError & { status?: number } = new globalThis.Error(info.message);
    e.status = info.status ?? undefined;
    throw e;
  }
}

// Re-export centralized date utilities for legacy import paths in pages/components
export { dateReviver, formatDateTime };
