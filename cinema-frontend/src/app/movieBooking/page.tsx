"use client";

import { useSearchParams } from "next/navigation";
import { formatDateTime, Showroom, useMovies } from "@/libs/cinemaApi";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

// === NEW: HARDCODED UNAVAILABLE SEATS ===
const UNAVAILABLE_SEATS = ["C4", "C5", "D2"];
// ========================================

// Define the props for a single seat
interface SeatProps {
  seatNumber: string;
  isSelected: boolean;
  isUnavailable: boolean; // NEW PROP
  onSelect: (seatNumber: string) => void;
}

//Single Seat
const Seat: React.FC<SeatProps> = ({ seatNumber, isSelected, isUnavailable, onSelect }) => {
  let seatClass = "";

  if (isUnavailable) {
    seatClass = "bg-red-700 cursor-not-allowed"; // Unavailable seat style (darker red for contrast)
  } else if (isSelected) {
    seatClass = "bg-purple-500 text-white"; // Selected seat style
  } else {
    seatClass = "bg-gray-600 hover:bg-gray-500 cursor-pointer transition-all duration-200 hover:scale-110"; // Available seat style
  }

  // Determine the handler: only call onSelect if the seat is NOT unavailable
  const handleClick = isUnavailable ? () => { } : () => onSelect(seatNumber);

  return (
    <div
      onClick={handleClick}
      className={`w-8 h-7 flex items-center justify-center rounded-t-lg ${seatClass}`}
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
  const roomId = params.get("showroomId") || "No showroom ID found";
  const start = params.get("start") || "";

  const { movies, status } = useMovies({ id: movieId || "0" });

  const movie = movies[0];

  // === STATE FOR TICKET QUANTITIES ===
  const [tickets, setTickets] = useState({
    adult: 0,
    child: 0,
    senior: 0,
  });

  const totalTickets = tickets.adult + tickets.child + tickets.senior;
  // ========================================

  // State to track selected seats
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectionError, setSelectionError] = useState<string>("");

  // Showroom state
  const [showroom, setShowroom] = useState<Showroom | null>(null);

  useEffect(() => {
    // Fetch all showrooms
    fetch(`http://localhost:8080/api/showrooms/${roomId}/showtimes`)
      .then((res) => res.json())
      .then((data: Showroom) => setShowroom(data))
      .catch(() => setShowroom({id: "error"}));
  }, [roomId]);

  const handleSelectSeat = (seatNumber: string) => {
    // Prevent selection if seat is unavailable
    if (UNAVAILABLE_SEATS.includes(seatNumber)) {
      setSelectionError(`Seat ${seatNumber} is already booked and unavailable.`);
      return;
    }

    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatNumber)) {
        // If seat is already selected, unselect it
        setSelectionError("");
        return prevSelectedSeats.filter((seat) => seat !== seatNumber);
      } else {
        // Otherwise, try to select it
        if (prevSelectedSeats.length < totalTickets) {
          setSelectionError("");
          return [...prevSelectedSeats, seatNumber];
        } else {
          // Prevent selection if max tickets are reached
          setSelectionError(
            `You can only select ${totalTickets} seat(s) for your purchase.`
          );
          return prevSelectedSeats;
        }
      }
    });
  };

  const handleTicketChange = (type: "adult" | "child" | "senior", value: string) => {
    const quantity = Math.max(0, parseInt(value) || 0); // Ensure quantity is non-negative
    setTickets((prevTickets) => {
      const newTickets = { ...prevTickets, [type]: quantity };
      const newTotalTickets = newTickets.adult + newTickets.child + newTickets.senior;

      // If the new total is less than the currently selected seats, trim the selectedSeats list
      if (newTotalTickets < selectedSeats.length) {
        // Filter out any seats that are now beyond the new total, ensuring unavailable seats aren't included
        const filteredSeats = selectedSeats
          .filter(seat => !UNAVAILABLE_SEATS.includes(seat)) // Exclude unavailable seats from being kept (if somehow selected)
          .slice(0, newTotalTickets);

        setSelectedSeats(filteredSeats);
        setSelectionError("Seat selection was automatically adjusted to match ticket count.");
      } else {
        setSelectionError("");
      }

      return newTickets;
    });
  };

  // removed duplicate

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
      <p className="text-lg">Showtime: {formatDateTime(new Date(start))}</p>

      <p className="text-lg">Showroom: {showroom?.id}</p>

      {/* === TICKET SELECTION SECTION === */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-sm p-4 border border-gray-700 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Select Tickets</h2>
        <div className="flex justify-between w-full">
          <label htmlFor="adult-tickets">Adult ($12.00)</label>
          <input
            id="adult-tickets"
            type="number"
            min="0"
            value={tickets.adult}
            onChange={(e) => handleTicketChange("adult", e.target.value)}
            className="w-16 p-1 text-white text-center rounded"
          />
        </div>
        <div className="flex justify-between w-full">
          <label htmlFor="child-tickets">Child ($8.00)</label>
          <input
            id="child-tickets"
            type="number"
            min="0"
            value={tickets.child}
            onChange={(e) => handleTicketChange("child", e.target.value)}
            className="w-16 p-1 text-white text-center rounded"
          />
        </div>
        <div className="flex justify-between w-full">
          <label htmlFor="senior-tickets">Senior ($10.00)</label>
          <input
            id="senior-tickets"
            type="number"
            min="0"
            value={tickets.senior}
            onChange={(e) => handleTicketChange("senior", e.target.value)}
            className="w-16 p-1 text-white text-center rounded"
          />
        </div>
        <p className="text-base font-bold pt-2">Total Tickets: {totalTickets}</p>
      </div>
      {/* ==================================== */}

      <div className="flex flex-col items-center space-y-4">
        {/* Error message for seat selection */}
        {selectionError && (
          <p className="text-red-400 text-center font-semibold">{selectionError}</p>
        )}

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
                  className={`${seatIndex === 1 || seatIndex === 5 ? "mr-4" : ""
                    }`}
                >
                  <Seat
                    seatNumber={seatNumber}
                    isSelected={selectedSeats.includes(seatNumber)}
                    // === PASS NEW PROP ===
                    isUnavailable={UNAVAILABLE_SEATS.includes(seatNumber)}
                    // =====================
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
            <div className="w-5 h-4 bg-purple-500 rounded-t-md"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 bg-red-700 rounded-t-md"></div> {/* Updated color to match code */}
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p>
          You have selected {selectedSeats.length} of {totalTickets} required seats:
        </p>
      </div>

      <button
        className="bg-purple-500 hover:bg-purple-600 transition-colors rounded-2xl px-4 py-2 text-2xl"
        disabled={selectedSeats.length !== totalTickets || totalTickets === 0}
        onClick={() => {
          if (selectedSeats.length !== totalTickets || totalTickets === 0) return;
          const params = new URLSearchParams();
          if (movieId) params.set("id", movieId);
          params.set("showtime", start);
          params.set("seats", selectedSeats.join(","));
          params.set("adult", String(tickets.adult));
          params.set("child", String(tickets.child));
          params.set("senior", String(tickets.senior));

          // Navigate to confirmation page with booking details in query
          window.location.href = `/movieBooking/confirm?${params.toString()}`;
        }}
      >
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