"use client";

import Image from "next/image";
import "./page.css";
import logo from "@/assets/logo.png"; // You can remove this too if unused
import { MovieQueryParams, useMovies } from "@/libs/cinemaApi";
import Movie from "@/models/movie";
import { FormEvent, ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import { getToken, clearToken } from "@/libs/authStore";

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
    <div>
      {/* NAVBAR REMOVED */}

      <div className="content">
        <form className="flex space-x-3" onSubmit={handleMovieSearch}>
          <input
            className="border-1 rounded-md px-1"
            type="text"
            placeholder="Enter a movie"
            name="titleInput"
          />
          <input
            className="border-1 rounded-md px-1"
            type="text"
            placeholder="Enter any amount of genres"
            name="genreInput"
          />
          <button className="bg-purple-600 rounded-2xl px-4 py-1" type="submit">
            Submit
          </button>

          {displayFilters && (
            <div className="flex items-center relative font-bold px-2">
              <span>{filteringByString}</span>
              <button
                className="absolute inset-0 opacity-0 hover:bg-red-500/90 hover:opacity-100 rounded-2xl transition-opacity duration-300"
                onClick={() => setFilterParams({})}
              >
                Remove Filters
              </button>
            </div>
          )}
        </form>

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
    </div>
  );
}

function getMovieList(movies: Movie[]): ReactElement {
  return (
    <ol className="flex space-x-5 space-y-5 flex-wrap">
      {movies.map((movie) => (
        <li key={movie.id}>
          <Link href={{ pathname: "/movieDetails", query: { id: movie.id } }}>
            <Image
              src={movie.poster}
              alt={`Movie poster of ${movie.title}`}
              width={200}
              height={250}
              className="rounded-lg transform hover:scale-110 transition duration-300 active:scale-95"
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}
