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
      <form className="movie-search-form" onSubmit={() => {}}>
        <input
          className="movie-search-input"
          type="text"
          placeholder="Enter a movie"
          disabled
        />
        <input
          className="movie-search-input"
          type="text"
          placeholder="Enter any amount of genres"
          disabled
        />
        <button className="movie-search-submit" type="submit" disabled>
          Submit
        </button>
      </form>

      {loading ? (
        <p className="now-showing">Loading movies...</p>
      ) : error ? (
        <p className="now-showing text-red-500">{error}</p>
      ) : (
        <>
          <p className="now-showing">Now Showing</p>
          {getMovieList(nowShowingMovies)}

          <div className="now-showing">Upcoming</div>
          {getMovieList(upcomingMovies)}
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
