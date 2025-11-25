package edu.uga.csci4050.cinema.controller;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uga.csci4050.cinema.model.Showroom;
import edu.uga.csci4050.cinema.repository.ShowroomRepository;
import edu.uga.csci4050.cinema.type.BookingRequest;
import edu.uga.csci4050.cinema.type.Showtime;

@RestController
@RequestMapping("api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    ShowroomRepository showroomRepository;

    @PostMapping
    public ResponseEntity<Showroom> bookSeats(@RequestBody BookingRequest req) {
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
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("EXCEPTION IN BOOKING CONTROLLER:");
            e.printStackTrace();
            throw e;
        }
    }
}
