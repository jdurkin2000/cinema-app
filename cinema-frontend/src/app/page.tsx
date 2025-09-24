'use client';
import React, { useState } from "react";
import { Button } from "./components/button";
import { Card, CardContent } from "./components/card";
import './page.css';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  // Hardcoded sample movies
  const movies = [
    {
      id: 1,
      title: "The Great Adventure",
      rating: "PG-13",
      description: "An epic journey across uncharted lands.",
      genre: "Adventure",
      status: "running",
      posterUrl: "https://via.placeholder.com/300x450?text=Great+Adventure",
      trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 2,
      title: "Romance in Paris",
      rating: "PG",
      description: "A heartfelt love story set in the city of lights.",
      genre: "Romance",
      status: "coming_soon",
      posterUrl: "https://via.placeholder.com/300x450?text=Romance+in+Paris",
      trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 3,
      title: "Galactic Wars",
      rating: "PG-13",
      description: "A battle for the fate of the galaxy.",
      genre: "Sci-Fi",
      status: "running",
      posterUrl: "https://via.placeholder.com/300x450?text=Galactic+Wars",
      trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

  const filteredMovies = movies.filter((m) => {
    const matchesTitle = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter ? m.genre === genreFilter : true;
    return matchesTitle && matchesGenre;
  });

  const genres = Array.from(new Set(movies.map((m) => m.genre)));

  return (
    <div className="homepage-container">
      {/* Top Bar / Header */}
      <header className="header">
        <div className="header-left">
          <img src="/logo.png" alt="CineBook Logo" className="logo-img" />
          <h1 className="logo-text">CineBook</h1>
        </div>
        <div className="header-right">
          <nav>
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Bookings</a>
            <a href="#" className="nav-link">About</a>
          </nav>
        </div>
      </header>

      {/* Search & Filter */}
      <section className="search-filter">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="genre-select"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </section>

      {/* Currently Running */}
      <section>
        <h2 className="section-title">Currently Running</h2>
        <div className="movies-grid">
          {filteredMovies.filter(m => m.status === "running").map((movie) => (
            <Card key={movie.id} className="movie-card">
              <CardContent>
                <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-rating">Rating: {movie.rating}</p>
                <p className="movie-description">{movie.description}</p>
                <div className="showtimes">
                  {['2:00 PM', '5:00 PM', '8:00 PM'].map(time => (
                    <Button key={time} variant="secondary" onClick={() => window.location.href=`/booking?movie=${movie.id}&time=${time}`}>{time}</Button>
                  ))}
                </div>
                <Button onClick={() => window.location.href=`/movie/${movie.id}`}>View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <h2 className="section-title">Coming Soon</h2>
        <div className="movies-grid">
          {filteredMovies.filter(m => m.status === "coming_soon").map((movie) => (
            <Card key={movie.id} className="movie-card">
              <CardContent>
                <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-rating">Rating: {movie.rating}</p>
                <p className="movie-description">{movie.description}</p>
                {movie.trailerUrl && (
                  <div className="trailer">
                    <iframe width="100%" height="200" src={movie.trailerUrl} title="Trailer" allowFullScreen></iframe>
                  </div>
                )}
                <Button onClick={() => window.location.href=`/movie/${movie.id}`}>View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        &copy; {new Date().getFullYear()} CineBook. All rights reserved.
      </footer>
    </div>
  );
}
