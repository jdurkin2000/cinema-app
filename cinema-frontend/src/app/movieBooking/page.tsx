"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Movie from "@/models/movie";
import { useSearchParams } from "next/navigation";


export default function Home() {
  const params = useSearchParams();
  const movieId = params.get("id");
  const showtime = params.get("showtime");
  
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
    </div>
  );
}
