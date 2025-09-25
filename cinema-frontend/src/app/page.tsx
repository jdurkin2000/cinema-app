"use client";

import Image from "next/image";
import "./page.css";
import logo from "@/assets/logo.png";
import { useMovies } from "@/libs/cinemaApi";
import Movie from "@/models/movie";
import { ReactElement } from "react";
import Link from "next/link";

export default function Home() {
  const { movies, loading, error } = useMovies();

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
        <p className="now-showing">Now Showing</p>
        {getMovieList(movies.filter((movie) => !movie.upcoming))}
        <div className="now-showing">Upcoming</div>
        {getMovieList(movies.filter((movie) => movie.upcoming))}
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
