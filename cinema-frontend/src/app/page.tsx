"use client"

import { useEffect, useState } from "react";
import Image from 'next/image'
import './page.css'

export default function Home() {
  const loadingMovie = {
    title: "Loading movie data..",
    poster: "/poster_loading.png",
    synopsis: "Skibidi Toilet Dubai Chocolate Labubu",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
  const [movie, setMovie] = useState(loadingMovie);
  useEffect(() => {
    fetch("http://localhost:8080/api/movies?title=slayer")
      .then(res => res.json())
      .then(data => setMovie(data[0]))
      .catch(err => console.error(err))
  })

  return (
    <div className="flex flex-col font-sans items-center justify-items-center">
      <nav className="topnav">
        <div className = "nav-links">
           <a href="#home">Home</a>
          <a href="#browse">Browse Movies</a>
          <a href="#about">About</a>
        </div>
      </nav>


      <div className="content">
        <pre className="text-xl">{movie.trailer}</pre>
        <p>{movie.synopsis}</p>
        <Image
          src={movie.poster}
          alt="Movie Poster"
          width={200}
          height={250}
        />
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
      </div>
    </div>
  );
}
