"use client";

import { useSearchParams } from "next/navigation";
import { useMovies } from "@/libs/cinemaApi";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const params = useSearchParams();
  const movieId = params.get("id");
  const showtime = params.get("showtime");
  const receivedParams = movieId && showtime;

  const { movies, loading, error } = useMovies({ id: movieId || "0" });

  if (loading) return <p>Loading page...</p>;
  if (!receivedParams)
    return <p>Error: Parameters were not passed to this page</p>;
  if (error) return <p>Error: {error.message}</p>;

  const movie = movies[0];

  return (
    <div className="flex flex-col font-sans items-center justify-center space-y-6 min-h-screen bg-black">
      <pre className="text-xl">{movie.title}</pre>
      <p>Showtime: {showtime}</p>
      <Image
        src="/booking_dummy.jpg"
        alt="Booking Selection for seats"
        width={500}
        height={350}
      />
      <button className="bg-purple-500 rounded-2xl px-2 py-0.5 text-2xl">
        Continue to checkout
      </button>
      <Link
        href={"/"}
        className="bg-purple-500 rounded-2xl px-2 py-0.5 text-2xl"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
