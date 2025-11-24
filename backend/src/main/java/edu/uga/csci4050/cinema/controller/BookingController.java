package edu.uga.csci4050.cinema.controller;

import java.time.LocalDateTime;
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
        LocalDateTime start;
        try {
            // Try parsing a plain LocalDateTime first
            start = LocalDateTime.parse(req.start());
        } catch (Exception ex1) {
            try {
                // Try OffsetDateTime (handles trailing Z or offsets) then convert
                start = java.time.OffsetDateTime.parse(req.start()).toLocalDateTime();
            } catch (Exception ex2) {
                try {
                    // Try Instant -> LocalDateTime at system zone
                    start = java.time.Instant.parse(req.start()).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                } catch (Exception ex3) {
                    return ResponseEntity.badRequest().build();
                }
            }
        }

        List<Showroom> showrooms = showroomRepository.findAll();
        for (Showroom showroom : showrooms) {
            List<Showtime> sts = showroom.getShowtimes();
            for (int i = 0; i < sts.size(); i++) {
                Showtime st = sts.get(i);
                if (st.movieId().equals(req.movieId()) && st.start().equals(start)) {
                    String[] existing = st.bookedSeats() == null ? new String[0] : st.bookedSeats();
                    Set<String> existingSet = new HashSet<>(Arrays.asList(existing));
                    // If any requested seat is already booked, return conflict
                    if (req.seats() != null) {
                        for (String seat : req.seats()) {
                            if (existingSet.contains(seat)) {
                                return ResponseEntity.status(409).build();
                            }
                        }
                    }
                    Set<String> merged = new HashSet<>(existingSet);
                    if (req.seats() != null) merged.addAll(Arrays.asList(req.seats()));
                    Showtime updated = new Showtime(st.movieId(), st.start(), merged.toArray(new String[0]));
                    sts.set(i, updated);
                    showroom.setShowtimes(sts);
                    Showroom saved = showroomRepository.save(showroom);
                    return ResponseEntity.ok(saved);
                }
            }
        }

        return ResponseEntity.notFound().build();
    }
}
