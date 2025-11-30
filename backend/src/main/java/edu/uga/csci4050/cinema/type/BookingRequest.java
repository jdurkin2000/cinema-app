package edu.uga.csci4050.cinema.type;

import java.util.Map;

/**
 * BookingRequest sent from the frontend when confirming a booking.
 * Includes the showtime, the seats being reserved, and optional ticket counts
 * (e.g. adult/child/senior) so the backend can persist full ticket info.
 */
public record BookingRequest(Showtime showtime, String[] seats, Map<String, Integer> ticketCounts) {
}
