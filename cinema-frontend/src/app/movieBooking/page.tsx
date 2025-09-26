"use client";

import { useSearchParams } from "next/navigation";
import { formatDateTime, useMovies } from "@/libs/cinemaApi";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";

// Define the props for a single seat
interface SeatProps {
  seatNumber: string;
  isSelected: boolean;
  onSelect: (seatNumber: string) => void;
}

//Single Seat
const Seat: React.FC<SeatProps> = ({ seatNumber, isSelected, onSelect }) => {
  const seatClass = isSelected
    ? "bg-purple-500 text-white" // Selected seat style
    : "bg-gray-600 hover:bg-gray-500"; // Available seat style

  return (
    <div
      onClick={() => onSelect(seatNumber)}
      className={`w-8 h-7 flex items-center justify-center rounded-t-lg cursor-pointer transition-all duration-200 hover:scale-110 ${seatClass}`}
    >
      <span className="text-xs">{seatNumber.substring(1)}</span>
    </div>
  );
};

// Define the seat layout for the cinema
const rows = [
  ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
  ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
  ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"],
  ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
  ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"],
];

//Main component

export default function Home() {
  const params = useSearchParams();
  const movieId = params.get("id");
  const showtime = params.get("showtime") || "No showtime found";
  const receivedParams = movieId && showtime;

  const { movies, loading, error } = useMovies({ id: movieId || "0" });

  // State to track selected seats
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSelectSeat = (seatNumber: string) => {
    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatNumber)) {
        // If seat is already selected unselect it
        return prevSelectedSeats.filter((seat) => seat !== seatNumber);
      } else {
        // Otherwise just select it
        return [...prevSelectedSeats, seatNumber];
      }
    });
  };

  const movie = movies[0];

  return (
    <div className="flex flex-col font-sans items-center justify-center space-y-6 min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold">{movie.title}</h1>
      <Image
        src={movie.poster}
        alt={`Movie poster of ${movie.title}`}
        width={200}
        height={250}
        className="rounded-lg transform hover:scale-110 transition duration-300 active:scale-95"
      />
      <p className="text-lg">Showtime: {formatDateTime(new Date(showtime))}</p>

      <div className="flex flex-col items-center space-y-4">
        <div
          className="bg-white text-black w-72 md:w-125 h-8 flex items-center justify-center font-bold rounded-sm shadow-lg shadow-white/30"
          style={{ transform: "perspective(500px) rotateX(-30deg)" }}
        >
          Movie Screen
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-3">
              <span className="w-4 text-center font-semibold">
                {String.fromCharCode(65 + rowIndex)}
              </span>

              {row.map((seatNumber, seatIndex) => (
                <div
                  key={seatNumber}
                  className={`${
                    seatIndex === 1 || seatIndex === 5 ? "mr-4" : ""
                  }`}
                >
                  <Seat
                    seatNumber={seatNumber}
                    isSelected={selectedSeats.includes(seatNumber)}
                    onSelect={handleSelectSeat}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-x-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 bg-gray-600 rounded-t-md"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 bg-purple-400 rounded-t-md"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 bg-red-400 rounded-t-md"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p>You have selected {selectedSeats.length} seats:</p>
      </div>

      <button className="bg-purple-500 hover:bg-purple-600 transition-colors rounded-2xl px-4 py-2 text-2xl">
        Continue to checkout
      </button>

      <Link
        href={"/"}
        className="bg-gray-700 hover:bg-gray-600 transition-colors rounded-2xl px-4 py-2 text-xl"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
