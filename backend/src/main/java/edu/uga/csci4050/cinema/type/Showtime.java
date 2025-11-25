package edu.uga.csci4050.cinema.type;

import java.time.Instant;

/**
 * Showtime record.
 * Uses Instant for start time to ensure UTC consistency.
 * Use DateTimeUtil for conversions to/from user-friendly formats.
 */
public record Showtime(String movieId, Instant start, String[] bookedSeats, String roomId) {
}
