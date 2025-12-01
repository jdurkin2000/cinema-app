package edu.uga.csci4050.cinema.controller;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uga.csci4050.cinema.model.Showroom;
import edu.uga.csci4050.cinema.model.TicketRecord;
import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.ShowroomRepository;
import edu.uga.csci4050.cinema.repository.UserRepository;
import edu.uga.csci4050.cinema.repository.MovieRepository;
import edu.uga.csci4050.cinema.repository.TicketRepository;
import edu.uga.csci4050.cinema.service.MailService;
import edu.uga.csci4050.cinema.model.TicketInfo;
import edu.uga.csci4050.cinema.type.TicketType;
import edu.uga.csci4050.cinema.type.BookingRequest;
import edu.uga.csci4050.cinema.type.Showtime;

@RestController
@RequestMapping("api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    ShowroomRepository showroomRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MovieRepository movieRepository;

    @Autowired
    TicketRepository ticketRepository;

    @Autowired
    MailService mailService;

    @PostMapping
    public ResponseEntity<Showroom> bookSeats(@RequestBody BookingRequest req, Authentication auth) {
        System.out.println("\n\n*** BOOKING CONTROLLER CALLED ***");
        System.out.println("Request object: " + req);

        try {
            System.out.println("=== BOOKING REQUEST ===");
            System.out.println("Showtime movieId: " + req.showtime().movieId());
            System.out.println("Showtime start: " + req.showtime().start());
            System.out.println("Showtime roomId: " + req.showtime().roomId());
            System.out.println("Seats to book: " + Arrays.toString(req.seats()));

            Showroom showroom = showroomRepository.findById(req.showtime().roomId()).orElseThrow();
            System.out.println("Found showroom: " + showroom.getId());
            System.out.println(
                    "Showroom showtimes count: "
                            + (showroom.getShowtimes() != null ? showroom.getShowtimes().size() : 0));

            Showtime st = req.showtime();

            String[] existing = st.bookedSeats() == null ? new String[0] : st.bookedSeats();
            Set<String> existingSet = new HashSet<>(Arrays.asList(existing));

            // If any requested seat is already booked, return conflict
            for (String seat : req.seats()) {
                if (existingSet.contains(seat)) {
                    System.out.println("Seat already booked: " + seat);
                    return ResponseEntity.status(409).build();
                }
            }

            Set<String> merged = new HashSet<>(existingSet);
            List<Showtime> showtimes = showroom.getShowtimes();

            if (showtimes == null) {
                System.out.println("ERROR: Showtimes list is null!");
                return ResponseEntity.notFound().build();
            }

            merged.addAll(Arrays.asList(req.seats()));

            Showtime updated = new Showtime(st.movieId(), st.start(), merged.toArray(new String[0]), st.roomId());

            // Find and replace the showtime that matches both movieId and start time
            boolean found = false;
            for (int i = 0; i < showtimes.size(); i++) {
                Showtime current = showtimes.get(i);
                System.out.println(
                        "Comparing: " + current.movieId() + " @ " + current.start() + " vs " + updated.movieId()
                                + " @ " + updated.start());
                if (current.movieId().equals(updated.movieId()) && current.start().equals(updated.start())) {
                    System.out.println("MATCH FOUND! Updating index: " + i);
                    showtimes.set(i, updated);
                    found = true;
                    break;
                }
            }
            if (!found) {
                System.out.println("ERROR: No matching showtime found!");
                return ResponseEntity.notFound().build();
            }

            // Save the showroom with the updated showtimes
            System.out.println("Saving showroom...");
            Showroom saved = showroomRepository.save(showroom);
            System.out
                    .println("Saved! Booked seats now: " + Arrays.toString(saved.getShowtimes().get(0).bookedSeats()));

            // Persist a ticket record to the authenticated user's document (if available)
            try {
                if (auth != null && auth.getName() != null) {
                    Optional<User> maybeUser = userRepository.findByEmail(auth.getName());
                    if (maybeUser.isPresent()) {
                        User user = maybeUser.get();
                        TicketRecord tr = new TicketRecord();
                        tr.setTicketNumber(UUID.randomUUID().toString());
                        tr.setMovieId(req.showtime().movieId());
                        // Try to populate movie title when available
                        movieRepository.findById(req.showtime().movieId())
                                .ifPresent(m -> tr.setMovieTitle(m.getTitle()));
                        tr.setShowroomId(saved.getId());
                        tr.setShowtime(req.showtime().start());
                        tr.setSeats(Arrays.asList(req.seats()));
                        Map<String, Integer> counts = req.ticketCounts();
                        tr.setTicketCounts(counts == null ? Map.of() : counts);

                        // Attach selected payment card snapshot if provided
                        try {
                            String cardId = req.paymentCardId();
                            if (cardId != null && !cardId.isBlank()) {
                                var cards = user.getPaymentCards();
                                var cardOpt = cards.stream().filter(c -> cardId.equals(c.getId())).findFirst();
                                if (cardOpt.isPresent()) {
                                    var card = cardOpt.get();
                                    // Create a shallow snapshot excluding sensitive numberEnc
                                    User.PaymentCard snap = new User.PaymentCard();
                                    snap.setId(card.getId());
                                    snap.setBrand(card.getBrand());
                                    snap.setLast4(card.getLast4());
                                    snap.setExpMonth(card.getExpMonth());
                                    snap.setExpYear(card.getExpYear());
                                    snap.setBillingName(card.getBillingName());
                                    snap.setBillingAddress(card.getBillingAddress());
                                    snap.setNumberEnc(null); // do not store PAN
                                    tr.setPaymentCard(snap);
                                }
                            }
                        } catch (Exception ex) {
                            System.out.println("Failed to attach payment card to ticket: " + ex.getMessage());
                        }

                        user.getTickets().add(tr);
                        userRepository.save(user);
                        System.out.println("Ticket record appended for user: " + user.getEmail());

                        // After persisting the user's ticket record, attempt to send a confirmation
                        // email
                        try {
                            // Compute simple price breakdown from ticketRepo
                            var ticketCountsMap = tr.getTicketCounts();
                            double adultPrice = ticketRepository.findByType(TicketType.ADULT).map(TicketInfo::getPrice)
                                    .orElse(0.0);
                            double childPrice = ticketRepository.findByType(TicketType.CHILD).map(TicketInfo::getPrice)
                                    .orElse(0.0);
                            double seniorPrice = ticketRepository.findByType(TicketType.SENIOR)
                                    .map(TicketInfo::getPrice).orElse(0.0);
                            int aCnt = ticketCountsMap == null ? 0 : ticketCountsMap.getOrDefault("adult", 0);
                            int cCnt = ticketCountsMap == null ? 0 : ticketCountsMap.getOrDefault("child", 0);
                            int sCnt = ticketCountsMap == null ? 0 : ticketCountsMap.getOrDefault("senior", 0);
                            double subtotal = aCnt * adultPrice + cCnt * childPrice + sCnt * seniorPrice;

                            StringBuilder body = new StringBuilder();
                            body.append("Hello ").append(user.getName() != null ? user.getName() : user.getEmail())
                                    .append(",\n\n");
                            body.append("Your booking is confirmed. Here are the details:\n\n");
                            body.append("Movie: ");
                            movieRepository.findById(req.showtime().movieId()).ifPresentOrElse(
                                    m -> body.append(m.getTitle()).append('\n'),
                                    () -> body.append("(unknown)\n"));
                            body.append("Showtime: ").append(req.showtime().start()).append('\n');
                            body.append("Seats: ").append(String.join(", ", req.seats())).append('\n');
                            body.append("\nTickets:\n");
                            if (aCnt > 0)
                                body.append("  Adult: ").append(aCnt).append(" x $")
                                        .append(String.format("%.2f", adultPrice)).append(" = $")
                                        .append(String.format("%.2f", aCnt * adultPrice)).append('\n');
                            if (cCnt > 0)
                                body.append("  Child: ").append(cCnt).append(" x $")
                                        .append(String.format("%.2f", childPrice)).append(" = $")
                                        .append(String.format("%.2f", cCnt * childPrice)).append('\n');
                            if (sCnt > 0)
                                body.append("  Senior: ").append(sCnt).append(" x $")
                                        .append(String.format("%.2f", seniorPrice)).append(" = $")
                                        .append(String.format("%.2f", sCnt * seniorPrice)).append('\n');
                            body.append("\nSubtotal: $").append(String.format("%.2f", subtotal)).append('\n');
                            body.append("Booking ID: ").append(tr.getTicketNumber()).append('\n');
                            body.append("\nThanks for booking with Cinema App!\n");

                            final String subject = "Your Cinema App Booking - " + (movieRepository
                                    .findById(req.showtime().movieId()).map(m -> m.getTitle()).orElse("Movie"));
                            // Send mail (best effort)
                            mailService.send(user.getEmail(), subject, body.toString());
                        } catch (Exception ex) {
                            System.out.println("Failed to send booking confirmation email: " + ex.getMessage());
                        }
                    } else {
                        System.out.println("Authenticated user not found in DB: " + auth.getName());
                    }
                } else {
                    System.out.println("No authenticated principal available to persist ticket record.");
                }
            } catch (Exception e) {
                System.out.println("Failed to persist ticket record: " + e.getMessage());
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("EXCEPTION IN BOOKING CONTROLLER:");
            e.printStackTrace();
            throw e;
        }
    }
}
