package edu.uga.csci4050.cinema.type;

import java.time.Duration;
import java.time.Instant;

/**
 * Show record representing a movie showing.
 * Uses Instant for startTime to ensure UTC consistency.
 * Use DateTimeUtil.toLocalDate(startTime) to get the date component if needed.
 */
public record Show(String showId, Instant startTime, Duration duration) {
}
