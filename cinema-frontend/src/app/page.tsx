"use client";

import Image from "next/image";
import "./page.css";
import logo from "@/assets/logo.png";
import { MovieQueryParams, useMovies } from "@/libs/cinemaApi";
import Movie from "@/models/movie";
import { FormEvent, ReactElement, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [filterParams, setFilterParams] = useState<MovieQueryParams>({});
  const { movies, status } = useMovies(filterParams);
  const currentState = status.currentState;

  if (currentState === "Error") alert(status.message);

  const handleMovieSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const titleValue = formData.get("titleInput") as string;
    const genresValue = formData.get("genreInput") as string;
    // Splits multiple genres into array
    const genres: string[] | null = genresValue?.trim()
      ? genresValue.split(/[^a-zA-Z0-9]+/)
      : null;

    if (!titleValue?.trim() && !genres) return;

    setFilterParams(
      (prev) =>
      (prev = {
        ...prev,
        title: titleValue.trim() ?? undefined,
        genres: genres ?? undefined,
      })
    );
  };

  const displayFilters = filterParams.genres || filterParams.title;
  let filteringByString = "Filtering Movies by:";
  if (filterParams.title) filteringByString += " Title - " + filterParams.title;
  if (filterParams.genres?.length)
    filteringByString += " Genres - " + filterParams.genres?.toString();

  return (
    <div>
      <nav className="topnav">
        <Image src={logo} alt="Site Logo" className="nav-logo" />
        <h1 className="title">CINEMA</h1>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#browse">Browse Movies</a>
          <a href="#about">About</a>
        </div>
      </nav>

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
            placeholder="Enter a genre(s)"
            name="genreInput"
          />
          <button
            className="bg-purple-600 rounded-2xl px-4 py-1 cursor-pointer"
            type="submit"
          >
            Submit
          </button>
          {displayFilters && (
            <div className="flex items-center relative font-bold px-2">
              <span className="relative">{filteringByString}</span>
              <button
                className="absolute inset-0 opacity-0 hover:bg-red-500/90 hover:opacity-100 rounded-2xl transition-opacity duration-300 cursor-pointer"
                onClick={() => setFilterParams({})}
              >
                Remove Filters
              </button>
            </div>
          )}
        </form>

        {currentState === "Success" ? (
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
      {movies.map((movie) => {
        return (
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
        );
      })}
    </ol>
  );
}
