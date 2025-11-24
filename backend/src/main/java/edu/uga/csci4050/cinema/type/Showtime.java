package edu.uga.csci4050.cinema.type;

import java.time.LocalDateTime;

public record Showtime(String movieId, LocalDateTime start, String[] bookedSeats, String roomId) {
}
