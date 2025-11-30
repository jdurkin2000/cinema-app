"use client";

import ValidatedImage from "@/components/ValidatedImage";
import "./page.css";
import Movie from "@/models/movie";
import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import {
  getCurrentlyShowingMovies,
  getUpcomingShowingMovies,
  getMovieIdsForDate,
} from "@/libs/showingsApi";

export default function Home() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [nameQuery, setNameQuery] = useState<string>("");
  const [genresQuery, setGenresQuery] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [movieIdsOnDate, setMovieIdsOnDate] = useState<Set<string>>(new Set());
  // Only hide Upcoming when a date filter is active
  const filtersApplied = selectedDate.trim().length > 0;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [showing, upcoming] = await Promise.all([
          getCurrentlyShowingMovies(),
          getUpcomingShowingMovies(),
        ]);
        setNowShowingMovies(showing);
        setUpcomingMovies(upcoming);
        setError(null);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    // If no date selected, clear filter set
    if (!selectedDate) {
      setMovieIdsOnDate(new Set());
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const ids = await getMovieIdsForDate(selectedDate);
        if (!cancelled) setMovieIdsOnDate(new Set(ids));
      } catch (err) {
        console.error("Failed to fetch movie IDs for date", err);
        if (!cancelled) setMovieIdsOnDate(new Set());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  return (
    <div className="content">
      <form
        className="movie-search-form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          className="movie-search-input"
          type="text"
          placeholder="Enter a movie"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
        />
        <input
          className="movie-search-input"
          type="text"
          placeholder="Enter any amount of genres (comma separated)"
          value={genresQuery}
          onChange={(e) => setGenresQuery(e.target.value)}
        />
        <input
          className="movie-search-input"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button className="movie-search-submit" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p className="now-showing">Loading movies...</p>
      ) : error ? (
        <p className="now-showing text-red-500">{error}</p>
      ) : (
        <>
          <p className="now-showing">Now Showing</p>
          {(() => {
            const filteredNow = filterMovies(
              nowShowingMovies,
              nameQuery,
              genresQuery,
              selectedDate,
              movieIdsOnDate
            );
            return (
              <>
                {getMovieList(filteredNow)}
                {filteredNow.length === 0 && (
                  <p className="text-gray-500">
                    No movies match your filters
                    {selectedDate ? " on that date." : "."}
                  </p>
                )}
              </>
            );
          })()}

          {!filtersApplied && (
            <>
              <div className="now-showing">Upcoming</div>
              {(() => {
                const filteredUpcoming = filterMovies(
                  upcomingMovies,
                  nameQuery,
                  genresQuery,
                  selectedDate,
                  movieIdsOnDate
                );
                return (
                  <>
                    {getMovieList(filteredUpcoming)}
                    {filteredUpcoming.length === 0 && (
                      <p className="text-gray-500">
                        No upcoming movies match your filters
                        {selectedDate ? " on that date." : "."}
                      </p>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </>
      )}
    </div>
  );
}

function getMovieList(movies: Movie[]): ReactElement {
  return (
    <ol className="movie-list">
      {movies.map((movie) => (
        <li key={movie.id}>
          <Link href={{ pathname: "/movieDetails", query: { id: movie.id } }}>
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
              const posterSrc = safeImageSrc(movie.poster);
              return (
                <div className="movie-card">
                  <ValidatedImage
                    src={posterSrc}
                    alt={`Movie poster of ${movie.title}`}
                    width={200}
                    height={250}
                    className="movie-poster"
                  />
                  <div className="movie-title text-center mt-2 text-sm text-shadow-white">
                    {movie.title}
                  </div>
                </div>
              );
            })()}
          </Link>
        </li>
      ))}
    </ol>
  );
}

function filterMovies(
  movies: Movie[],
  nameQuery: string,
  genresQuery: string,
  selectedDate?: string,
  movieIdsOnDate?: Set<string>
) {
  const name = nameQuery.trim().toLowerCase();
  const genreParts = genresQuery
    .split(",")
    .map((g) => g.trim().toLowerCase())
    .filter((g) => g.length > 0);

  return movies.filter((m) => {
    const matchesName =
      name.length === 0 || m.title.toLowerCase().includes(name);
    const matchesGenres =
      genreParts.length === 0 ||
      genreParts.every((g) =>
        m.genres.map((gg) => gg.toLowerCase()).some((gg) => gg.includes(g))
      );

    // If a date is selected, only include movies that have showtimes on that date.
    // IMPORTANT: when a date is selected and the fetched set is empty, that means
    // no movies are scheduled on that date — we should return no movies.
    if (selectedDate) {
      const onDate = movieIdsOnDate ? movieIdsOnDate.has(m.id) : false;
      return matchesName && matchesGenres && onDate;
    }

    return matchesName && matchesGenres;
  });
}
