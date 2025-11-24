"use client";

import Image from "next/image";
import "./page.css";
import Movie from "@/models/movie";
import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import {
  getCurrentlyShowingMovies,
  getUpcomingShowingMovies,
} from "@/libs/showingsApi";

export default function Home() {
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [nameQuery, setNameQuery] = useState<string>("");
  const [genresQuery, setGenresQuery] = useState<string>("");
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
          {getMovieList(filterMovies(nowShowingMovies, nameQuery, genresQuery))}

          <div className="now-showing">Upcoming</div>
          {getMovieList(filterMovies(upcomingMovies, nameQuery, genresQuery))}
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
            <Image
              src={movie.poster}
              alt={`Movie poster of ${movie.title}`}
              width={200}
              height={250}
              className="movie-poster"
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}

function filterMovies(movies: Movie[], nameQuery: string, genresQuery: string) {
  const name = nameQuery.trim().toLowerCase();
  const genreParts = genresQuery
    .split(",")
    .map((g) => g.trim().toLowerCase())
    .filter((g) => g.length > 0);

  return movies.filter((m) => {
    const matchesName = name.length === 0 || m.title.toLowerCase().includes(name);
    const matchesGenres =
      genreParts.length === 0 ||
      genreParts.every((g) => m.genres.map((gg) => gg.toLowerCase()).some((gg) => gg.includes(g)));
    return matchesName && matchesGenres;
  });
}
