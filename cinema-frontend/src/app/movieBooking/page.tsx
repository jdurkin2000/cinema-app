"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Movie from "@/models/movie";

export default function Home() {
  const loadingMovie: Movie = {
    _id: -1,
    title: "Loading movie data..",
    poster: "/poster_loading.png",
    synopsis: "Skibidi Toilet Dubai Chocolate Labubu",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    genres: ["Weeb", "Horror"],
    cast: ["Spongebob", "Patrick"],
    director: "John Cena",
    producer: "Danny Devito",
    reviews: ["Yes", "Cool"],
    rating: "NR",
    showtimes: [""],
    released: "2025-11-11",
    isUpcoming: false,
  };
  const [movie, setMovie] = useState(loadingMovie);
  useEffect(() => {
    fetch("http://localhost:8080/api/movies?title=slayer")
      .then((res) => res.json())
      .then((data) => setMovie(data[0]))
      .catch((err) => console.error(err));
  });

  return (
    <div className="flex flex-col font-sans items-center justify-items-center">
      <pre className="text-xl">{movie.title}</pre>
      <p>Rated: {movie.rating}</p>
      <p>{movie.synopsis}</p>
      <Image src={movie.poster} alt="Movie Poster" width={200} height={250} />
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          width="560"
          height="315"
          src={movie.trailer}
          title="YouTube video player"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p>Available Showtimes:</p>
      <ul>
        {movie.showtimes.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
