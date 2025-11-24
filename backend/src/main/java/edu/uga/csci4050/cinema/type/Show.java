package edu.uga.csci4050.cinema.type;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;

public record Show(String showId, LocalDate date, Instant startTime, Duration duration) {
}
