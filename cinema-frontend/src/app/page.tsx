"use client";

import Image from "next/image";
import "./page.css";
import logo from "@/assets/logo.png";
import { MovieQueryParams, useMovies } from "@/libs/cinemaApi";
import Movie from "@/models/movie";
import { FormEvent, ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import { getToken, clearToken } from "@/libs/authStore";
import { scheduleMovie } from "@/libs/showingsApi";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Home() {
  const [filterParams, setFilterParams] = useState<MovieQueryParams>({});
  const { movies, status } = useMovies(filterParams);

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUsername(decoded.name || decoded.sub);
      }
    }
  }, []);

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    clearToken();
    setUsername(null);
    window.location.reload();
  };

  const handleMovieSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const titleValue = (formData.get("titleInput") as string)?.trim();
    const genresValue = (formData.get("genreInput") as string)?.trim();

    const genres = genresValue
      ? genresValue.split(/[^a-zA-Z0-9]+/).filter(Boolean)
      : undefined;

    if (!titleValue && !genres) return;

    setFilterParams({
      title: titleValue || undefined,
      genres,
    });
  };

  const displayFilters = filterParams.title || filterParams.genres?.length;

  const filteringByString = [
    filterParams.title && `Title - ${filterParams.title}`,
    filterParams.genres?.length &&
      `Genres - ${filterParams.genres.join(", ")}`,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="content">
      <form className="movie-search-form" onSubmit={handleMovieSearch}>
        <input
          className="movie-search-input"
          type="text"
          placeholder="Enter a movie"
          name="titleInput"
        />
        <input
          className="movie-search-input"
          type="text"
          placeholder="Enter any amount of genres"
          name="genreInput"
        />
        <button className="movie-search-submit" type="submit">
          Submit
        </button>
      </form>
        {displayFilters && (
          <div className="filter-display">
            <span>{filteringByString}</span>
            <button
              className="remove-filters-button"
              onClick={() => setFilterParams({})}
            >
              Remove Filters
            </button>
          </div>
        )}
      

      {status.currentState === "Success" ? (
        <>
          <p className="now-showing">Now Showing</p>
          {getMovieList(movies.filter((movie) => !movie.upcoming))}

          <div className="now-showing">Upcoming</div>
          {getMovieList(movies.filter((movie) => movie.upcoming))}
        </>
      ) : (
        <p className="now-showing text-red-500">{status.message}</p>
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

function populateShowrooms(movies: Movie[]) {
  const showroomids = ["a", "b", "c"];
  let currentId = 0;

  movies.forEach(movie => {
    scheduleMovie(movie, movie.showtimes[0], showroomids[currentId++]);
  });
}

