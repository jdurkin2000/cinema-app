package edu.uga.csci4050.cinema.type;

public record BookingRequest(String movieId, String start, String[] seats) {
}
