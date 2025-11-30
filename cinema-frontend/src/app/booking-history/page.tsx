"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/libs/authStore";
import "./booking-history.css";

const API_URL = "http://localhost:8080/api";

interface TicketRecord {
  ticketNumber: string;
  movieId: string;
  movieTitle: string;
  showroomId: string;
  showtime: string;
  seats: string[];
  ticketCounts: { [key: string]: number };
  createdAt: string;
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningTicket, setReturningTicket] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch booking history");
        }

        const data = await response.json();
        setTickets(data.tickets || []);
      } catch (err) {
        console.error("Error fetching booking history:", err);
        setError("Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [router]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTicketCounts = (counts: { [key: string]: number }) => {
    if (!counts || Object.keys(counts).length === 0) return "N/A";
    return Object.entries(counts)
      .map(([type, count]) => `${count} ${type}`)
      .join(", ");
  };

  const getMinutesUntilShow = (showtimeStr: string): number => {
    const showtime = new Date(showtimeStr);
    const now = new Date();
    return Math.floor((showtime.getTime() - now.getTime()) / (1000 * 60));
  };

  const handleReturnTicket = async (ticketNumber: string) => {
    if (!confirm("Are you sure you want to return this ticket?")) {
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setReturningTicket(ticketNumber);

    try {
      const response = await fetch(
        `${API_URL}/profile/tickets/${ticketNumber}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        throw new Error(
          `Failed to return ticket: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      // Show refund eligibility message
      const message = result.refundEligible
        ? `Ticket returned successfully! You are eligible for a full refund (cancelled ${result.minutesUntilShow} minutes before showtime). A confirmation email has been sent.`
        : `Ticket returned. Since the cancellation was within 60 minutes of the showtime, no refund is available. A confirmation email has been sent.`;

      alert(message);

      // Remove ticket from local state
      setTickets((prev) => prev.filter((t) => t.ticketNumber !== ticketNumber));
    } catch (err) {
      console.error("Error returning ticket:", err);
      alert(
        `Failed to return ticket: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setReturningTicket(null);
    }
  };

  if (loading) {
    return (
      <div className="booking-history-container">
        <h1>Booking History</h1>
        <p className="loading-message">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-history-container">
        <h1>Booking History</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="booking-history-container">
      <h1>Booking History</h1>
      {tickets.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
          <button onClick={() => router.push("/")} className="back-button">
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((ticket) => {
              const minutesUntilShow = getMinutesUntilShow(ticket.showtime);
              const isPastShow = minutesUntilShow < 0;
              const eligibleForRefund = minutesUntilShow >= 60;

              return (
                <div key={ticket.ticketNumber} className="ticket-card">
                  <div className="ticket-header">
                    <h2 className="movie-title">
                      {ticket.movieTitle || "Movie"}
                    </h2>
                    <span className="ticket-number">
                      #{ticket.ticketNumber.slice(0, 8)}
                    </span>
                  </div>
                  <div className="ticket-details">
                    <div className="detail-row">
                      <span className="detail-label">Showtime:</span>
                      <span className="detail-value">
                        {formatDate(ticket.showtime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Showroom:</span>
                      <span className="detail-value">{ticket.showroomId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Seats:</span>
                      <span className="detail-value">
                        {ticket.seats.join(", ")}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tickets:</span>
                      <span className="detail-value">
                        {formatTicketCounts(ticket.ticketCounts)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Booked:</span>
                      <span className="detail-value">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!isPastShow && (
                    <div className="ticket-actions">
                      <button
                        onClick={() => handleReturnTicket(ticket.ticketNumber)}
                        disabled={returningTicket === ticket.ticketNumber}
                        className={`return-button ${
                          !eligibleForRefund ? "no-refund" : ""
                        }`}
                      >
                        {returningTicket === ticket.ticketNumber
                          ? "Processing..."
                          : "Return Ticket"}
                      </button>
                      {eligibleForRefund ? (
                        <span className="refund-notice eligible">
                          Full refund available
                        </span>
                      ) : (
                        <span className="refund-notice not-eligible">
                          No refund (less than 60 min)
                        </span>
                      )}
                    </div>
                  )}
                  {isPastShow && (
                    <div className="ticket-actions">
                      <span className="past-show-notice">Show has passed</span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
