"use client";


import { useState } from "react";
import Image from "next/image";
import { useMovies } from "@/libs/cinemaApi";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./movieDetails.css";

export default function Home() {
  const params = useSearchParams();
  const movieId = params.get("id");

  const { movies, status } = useMovies({ id: movieId || "0" });
  const [selectedShowtime, setSelectedShowtime] = useState<Date | null>(null);
  const [isShowtimeOpen, setIsShowtimeOpen] = useState(false);

  const onPickShowtime = (time: Date) => {
    setSelectedShowtime(time);
    setIsShowtimeOpen(true);
  };

  const movie = movies[0];
  const currentState = status.currentState;
  const isLoading = currentState === "Loading";

  return (
    <main className="page-container">
      {/* Header */}
      <header className="movie-header">
        <h1 className="movie-title-container">
          {movie?.title}
          <Link href="/" className="homepage-link">
            Return to Homepage
          </Link>
        </h1>
        {!isLoading && movie && (
          <p className="movie-rating">
            Rating: <span>{movie.rating}</span>
          </p>
        )}
      </header>

      {/* Content */}
      <section className="movie-content-grid">
        {/* Poster + Quick Facts */}
        <div className="poster-container">
          <div className="poster-wrapper">
            {isLoading ? (
              <div className="skeleton" style={{ height: "420px" }} />
            ) : (
              <Image
                src={movie?.poster || ""}
                alt={`${movie?.title} poster`}
                width={800}
                height={1200}
                className="poster-image"
              />
            )}
          </div>

          {/* Genres */}
          <div className="genres-container">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="skeleton genre-tag" />
                ))
              : movie?.genres.map((g: string, i: number) => (
                  <span key={i} className="genre-tag">
                    {g}
                  </span>
                ))}
          </div>

          {/* Cast/Crew */}
          <div className="cast-crew-container">
            {isLoading ? (
              <div className="skeleton" style={{ height: "80px" }} />
            ) : (
              <dl className="cast-crew-grid">
                <div>
                  <dt className="cast-crew-label">Director</dt>
                  <dd className="cast-crew-value">{movie?.director}</dd>
                </div>
                <div>
                  <dt className="cast-crew-label">Producer</dt>
                  <dd className="cast-crew-value">{movie?.producer}</dd>
                </div>
                {movie?.cast.length > 0 && (
                  <div className="col-span-2">
                    <dt className="cast-crew-label">Cast</dt>
                    <dd className="cast-wrap">
                      {movie.cast.map((name: string, i: number) => (
                        <span key={i} className="cast-name">
                          {name}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>

        {/* Details + Trailer + Showtimes */}
        <div className="section-container">
          {/* Synopsis */}
          <h2 className="section-title">Synopsis</h2>
          {isLoading ? (
            <div className="skeleton" style={{ height: "100px", marginTop: "0.75rem" }} />
          ) : (
            <p className="section-text">{movie?.synopsis}</p>
          )}

          {/* Trailer */}
          {isLoading ? (
            <div className="skeleton trailer-wrapper" />
          ) : movie?.trailer ? (
            <div className="trailer-wrapper">
              <iframe
                src={movie.trailer}
                title={`${movie?.title} trailer`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="section-text" style={{ opacity: 0.7 }}>
              No trailer available.
            </p>
          )}

          {/* Showtimes */}
          <h2 className="section-title">Available showtimes</h2>
          {isLoading ? (
            <div className="showtimes-list">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="skeleton showtime-btn" />
              ))}
            </div>
          ) : movie?.showtimes.length ? (
            <ul className="showtimes-list">
              {movie.showtimes.map((value: Date, index: number) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => onPickShowtime(value)}
                    className="showtime-btn"
                    aria-label={`Choose showtime ${value.toLocaleString()}`}
                  >
                    {value.toLocaleString()}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-text" style={{ opacity: 0.7 }}>
              No upcoming showtimes listed.
            </p>
          )}
        </div>

        {/* Showtime Modal */}
        {isShowtimeOpen && (
          <div className="showtime-modal">
            <div className="showtime-modal-content">
              <h3 className="section-title">Confirm your showtime</h3>
              <p className="section-text" style={{ marginTop: "0.5rem" }}>
                {selectedShowtime
                  ? `You picked ${selectedShowtime.toLocaleString()}.`
                  : "Pick a time."}
              </p>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-btn"
                  onClick={() => setIsShowtimeOpen(false)}
                >
                  Cancel
                </button>
                <Link
                  href={{
                    pathname: "/movieBooking",
                    query: {
                      id: movie?.id,
                      showtime: selectedShowtime?.toISOString(),
                    },
                  }}
                  className="modal-btn"
                >
                  Continue
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {currentState === "Error" && (
          <div className="error-box">
            <p>Failed to load movie.</p>
            <p style={{ opacity: 0.8 }}>{status.message}</p>
          </div>
        )}
      </section>
    </main>
  );
}
