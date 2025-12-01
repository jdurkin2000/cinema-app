package edu.uga.csci4050.cinema.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Embedded ticket record stored on the User document for each confirmed
 * booking.
 */
public class TicketRecord {

  private String ticketNumber;
  private String movieId;
  private String movieTitle;
  private String showroomId;
  private Instant showtime;
  private List<String> seats;
  private Map<String, Integer> ticketCounts; // e.g. {"adult":2, "child":1}
  private Instant createdAt = Instant.now();
  // Snapshot of payment card used for this ticket (excluding sensitive PAN)
  private User.PaymentCard paymentCard;

  public String getTicketNumber() {
    return ticketNumber;
  }

  public void setTicketNumber(String ticketNumber) {
    this.ticketNumber = ticketNumber;
  }

  public String getMovieId() {
    return movieId;
  }

  public void setMovieId(String movieId) {
    this.movieId = movieId;
  }

  public String getMovieTitle() {
    return movieTitle;
  }

  public void setMovieTitle(String movieTitle) {
    this.movieTitle = movieTitle;
  }

  public String getShowroomId() {
    return showroomId;
  }

  public void setShowroomId(String showroomId) {
    this.showroomId = showroomId;
  }

  public Instant getShowtime() {
    return showtime;
  }

  public void setShowtime(Instant showtime) {
    this.showtime = showtime;
  }

  public List<String> getSeats() {
    return seats;
  }

  public void setSeats(List<String> seats) {
    this.seats = seats;
  }

  public Map<String, Integer> getTicketCounts() {
    return ticketCounts;
  }

  public void setTicketCounts(Map<String, Integer> ticketCounts) {
    this.ticketCounts = ticketCounts;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public User.PaymentCard getPaymentCard() {
    return paymentCard;
  }

  public void setPaymentCard(User.PaymentCard paymentCard) {
    this.paymentCard = paymentCard;
  }
}
