"use client";

import Image from "next/image";
import "./page.css";
import logo from "@/assets/logo.png";
import { MovieQueryParams, useMovies } from "@/libs/cinemaApi";
import Movie from "@/models/movie";
// Updated React imports
import { FormEvent, ReactElement, useState, useEffect } from "react";
import Link from "next/link";
// Import the *correct* auth store functions
import { getToken, clearToken } from "@/libs/authStore";

/**
 * Decodes a JWT token to get the payload.
 * @param token The JWT string.
 *@returns The parsed JSON payload or null if decoding fails.
 */
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

export default function Home() {
  const [filterParams, setFilterParams] = useState<MovieQueryParams>({});
  const { movies, status } = useMovies(filterParams);
  const currentState = status.currentState;

  // State to hold the user's name. If null, user is not logged in.
  const [username, setUsername] = useState<string | null>(null);

  // Check for login token on page load (client-side)
  useEffect(() => {
    // Use the correct getToken() function from your authStore
    const token = getToken();
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        // A JWT payload typically has 'name' or 'sub' (subject) for the username
        setUsername(decoded.name || decoded.sub);
      }
    }
  }, []); // The empty array [] means this runs once on mount

  /**
   * Handles the user clicking the "Logout" button.
   */
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Stop the link from trying to navigate
    clearToken(); // Use the correct clearToken() function
    setUsername(null); // Clear the username from state
    window.location.reload(); // Reload the page to reset everything
  };

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
          {/* <a href="#home">Home</a> */}
          {/* <a href="#browse">Browse Movies</a> */}
          {/* <a href="#about">About</a> */}

          {/* --- Conditional Login/Logout Display --- */}
          {username ? (
            // User IS logged in
            <>
              <Link href="/profile" className="text-white font-semibold">
                Welcome, {username}
              </Link>
              <Link href="/profile" className="cursor-pointer">
                Edit Profile
              </Link>
              <a href="#" onClick={handleLogout} className="cursor-pointer">
                Logout
              </a>
            </>
          ) : (
            // User is NOT logged in
            <Link href={"/login"}>Login</Link>
          )}
          {/* --- End of Conditional Display --- */}

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
            placeholder="Enter any amount of genres"
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

