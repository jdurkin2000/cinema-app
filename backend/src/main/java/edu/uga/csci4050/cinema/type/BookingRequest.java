package edu.uga.csci4050.cinema.type;

import java.util.Map;

/**
 * BookingRequest sent from the frontend when confirming a booking.
 * Includes the showtime, the seats being reserved, optional ticket counts
 * (e.g. adult/child/senior), and the selected payment card ID to persist
 * payment details with the ticket.
 */
public record BookingRequest(Showtime showtime, String[] seats, Map<String, Integer> ticketCounts,
        String paymentCardId) {
}
