"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { formatDateTime } from "@/utils/dateTimeUtil";
import Movie from "@/models/movie";
import { Showroom, Showtime } from "@/models/shows";
import { useMovies } from "@/libs/cinemaApi";
import { SHOWROOMS_API } from "@/config/apiConfig";
import "./schedule-movie.css";

const showroomsApiBase = SHOWROOMS_API;

interface ScheduleMoviePageState {
  showrooms: Showroom[];
  movies: Movie[];
  selectedShowroomId: string | null;
  selectedMovieId: string | null;
  selectedTime: string;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function ScheduleMoviePage() {
  const { movies: allMovies, status: moviesStatus } = useMovies();
  const [state, setState] = useState<ScheduleMoviePageState>({
    showrooms: [],
    movies: [],
    selectedShowroomId: null,
    selectedMovieId: null,
    selectedTime: "",
    loading: true,
    error: null,
    success: null,
  });

  // Fetch showrooms on mount
  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

        const res = await axios.get<Showroom[]>(showroomsApiBase, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setState((prev) => ({
          ...prev,
          showrooms: res.data,
          loading: false,
        }));
      } catch (err: any) {
        console.error("Failed to fetch showrooms:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
        });
        setState((prev) => ({
          ...prev,
          error: "Failed to load showrooms. Please try again.",
          loading: false,
        }));
      }
    };

    fetchShowrooms();
  }, []);

  // Update movies when they're fetched
  useEffect(() => {
    if (moviesStatus.currentState === "Success") {
      setState((prev) => ({
        ...prev,
        movies: allMovies,
      }));
    }
  }, [moviesStatus, allMovies]);

  const handleShowroomSelect = (showroomId: string) => {
    setState((prev) => ({
      ...prev,
      selectedShowroomId: showroomId,
      selectedMovieId: null,
      selectedTime: "",
      error: null,
      success: null,
    }));
  };

  const handleMovieSelect = (movieId: string) => {
    setState((prev) => ({
      ...prev,
      selectedMovieId: movieId,
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      selectedTime: e.target.value,
    }));
  };

  const handleScheduleShowtime = async () => {
    if (
      !state.selectedShowroomId ||
      !state.selectedMovieId ||
      !state.selectedTime
    ) {
      setState((prev) => ({
        ...prev,
        error: "Please select a showroom, movie, and time.",
      }));
      return;
    }

    // Check for duplicate showtime in the same showroom on the same calendar date
    const showroom = state.showrooms.find(
      (s) => s.id === state.selectedShowroomId
    );

    if (!showroom) {
      setState((prev) => ({
        ...prev,
        error: "Selected showroom not found.",
      }));
      return;
    }

    const newStart = new Date(state.selectedTime);

    // Prevent scheduling a showtime in the past
    const now = new Date();
    if (newStart.getTime() <= now.getTime()) {
      setState((prev) => ({
        ...prev,
        error:
          "Cannot schedule a showtime in the past. Please choose a future date and time.",
      }));
      return;
    }

    // Conflict window: 5 hours before/after existing showtime are considered conflicting.
    const HOURS_BUFFER = 5;
    const msInHour = 1000 * 60 * 60;

    const hasConflict = showroom.showtimes.some((st) => {
      const existing = new Date(st.start);
      const diffMs = Math.abs(existing.getTime() - newStart.getTime());
      const diffHours = diffMs / msInHour;
      return diffHours < HOURS_BUFFER; // conflict if within 5 hours
    });

    if (hasConflict) {
      setState((prev) => ({
        ...prev,
        error: `A showtime is already scheduled in Showroom ${showroom.id} within ${HOURS_BUFFER} hours of the selected time. Please choose a different time.`,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      success: null,
    }));

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken")
          : null;
      if (!token) {
        setState((prev) => ({
          ...prev,
          error:
            "Unauthorized: please log in to schedule showtimes (admin or user).",
        }));
        return;
      }
      const newShowtime: Showtime = {
        movieId: state.selectedMovieId,
        start: new Date(state.selectedTime).toISOString(),
        bookedSeats: [],
        roomId: showroom.id,
      };

      const url = `${showroomsApiBase}/${state.selectedShowroomId}/showtimes`;
      await axios.post(url, newShowtime, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Get selected movie title for success message
      const selectedMovie = state.movies.find(
        (m) => m.id === state.selectedMovieId
      );
      const selectedShowroom = state.showrooms.find(
        (s) => s.id === state.selectedShowroomId
      );

      setState((prev) => ({
        ...prev,
        selectedShowroomId: null,
        selectedMovieId: null,
        selectedTime: "",
        loading: false,
        success: `Scheduled "${selectedMovie?.title}" in Showroom ${
          selectedShowroom?.id
        } for ${formatDateTime(newShowtime.start)}`,
      }));

      // Refresh showrooms
      const res = await axios.get<Showroom[]>(showroomsApiBase);
      setState((prev) => ({
        ...prev,
        showrooms: res.data,
      }));
    } catch (err: unknown) {
      let errorMessage = "Failed to schedule showtime. Please try again.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          errorMessage = "Unauthorized: please log in and try again.";
        } else if (
          err.response?.data &&
          typeof err.response.data === "object"
        ) {
          const data = err.response.data as { message?: string };
          if (data.message) errorMessage = data.message;
        }
      }
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  };

  const selectedShowroom = state.showrooms.find(
    (s) => s.id === state.selectedShowroomId
  );
  const selectedMovie = state.movies.find(
    (m) => m.id === state.selectedMovieId
  );

  if (state.loading && state.showrooms.length === 0) {
    return (
      <div className="schedule-movie-container">
        <h1>Schedule Movie Showtime</h1>
        <p className="loading">Loading showrooms...</p>
      </div>
    );
  }

  return (
    <div className="schedule-movie-container">
      <h1>Schedule Movie Showtime</h1>

      {state.error && <div className="alert alert-error">{state.error}</div>}
      {state.success && (
        <div className="alert alert-success">{state.success}</div>
      )}

      <div className="schedule-movie-content">
        {/* Showroom Selection */}
        <div className="section">
          <h2>Step 1: Select a Showroom</h2>
          <div className="showroom-grid">
            {state.showrooms.length === 0 ? (
              <p>No showrooms available.</p>
            ) : (
              state.showrooms.map((showroom) => (
                <button
                  key={showroom.id}
                  className={`showroom-card ${
                    state.selectedShowroomId === showroom.id ? "active" : ""
                  }`}
                  onClick={() => handleShowroomSelect(showroom.id)}
                >
                  <div className="showroom-id">Showroom {showroom.id}</div>
                  <div className="showroom-showtimes">
                    {showroom.showtimes.length} showtime(s)
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Movie Selection */}
        {state.selectedShowroomId && (
          <div className="section">
            <h2>Step 2: Select a Movie</h2>
            {state.movies.length === 0 ? (
              <p>No movies available.</p>
            ) : (
              <div className="movie-grid">
                {state.movies.map((movie) => (
                  <button
                    key={movie.id}
                    className={`movie-card ${
                      state.selectedMovieId === movie.id ? "active" : ""
                    }`}
                    onClick={() => handleMovieSelect(movie.id)}
                  >
                    {(() => {
                      const safeImageSrc = (src?: string | null) => {
                        if (!src) return "/poster_loading.png";
                        if (
                          src.startsWith("/") ||
                          src.startsWith("http://") ||
                          src.startsWith("https://")
                        )
                          return src;
                        return "/poster_loading.png";
                      };
                      return (
                        <img
                          src={safeImageSrc(movie.poster)}
                          alt={movie.title}
                          onError={(e) => {
                            try {
                              (e.target as HTMLImageElement).src =
                                "/poster_loading.png";
                            } catch {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }
                          }}
                        />
                      );
                    })()}
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="rating">{movie.rating}</p>
                      <p className="genres">{movie.genres.join(", ")}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Time Selection */}
        {state.selectedShowroomId && state.selectedMovieId && (
          <div className="section">
            <h2>Step 3: Select a Showtime</h2>
            <div className="time-input-group">
              <label htmlFor="showtime">Showtime:</label>
              <input
                id="showtime"
                type="datetime-local"
                value={state.selectedTime}
                onChange={handleTimeChange}
                className="time-input"
              />
            </div>
          </div>
        )}

        {/* Summary and Confirm */}
        {state.selectedShowroomId &&
          state.selectedMovieId &&
          state.selectedTime && (
            <div className="section summary">
              <h2>Summary</h2>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="label">Showroom:</span>
                  <span className="value">Showroom {selectedShowroom?.id}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Movie:</span>
                  <span className="value">{selectedMovie?.title}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Showtime:</span>
                  <span className="value">
                    {formatDateTime(state.selectedTime)}
                  </span>
                </div>
              </div>
              <button
                className="btn-schedule"
                onClick={handleScheduleShowtime}
                disabled={state.loading}
              >
                {state.loading ? "Scheduling..." : "Schedule Showtime"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
