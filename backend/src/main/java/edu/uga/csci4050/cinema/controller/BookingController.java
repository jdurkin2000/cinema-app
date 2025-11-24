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
        Showroom showroom = showroomRepository.findById(req.showtime().roomId()).orElseThrow();
        Showtime st = req.showtime();

        String[] existing = st.bookedSeats() == null ? new String[0] : st.bookedSeats();
        Set<String> existingSet = new HashSet<>(Arrays.asList(existing));

        // If any requested seat is already booked, return conflict
        for (String seat : req.seats()) {
            if (existingSet.contains(seat)) {
                return ResponseEntity.status(409).build();
            }
        }

        Set<String> merged = new HashSet<>(existingSet);
        List<Showtime> showtimes = showroom.getShowtimes();
     
        merged.addAll(Arrays.asList(req.seats()));

        Showtime updated = new Showtime(st.movieId(), st.start(), merged.toArray(new String[0]), st.roomId());

        boolean found = false;
        for (int i = 0; i < showtimes.size(); i++) {
            if (showtimes.get(i).start().equals(updated.start())) {
                showtimes.set(i, updated);
                found = true;
            }
        }
        if (!found)
            return ResponseEntity.notFound().build();

        Showroom saved = showroomRepository.save(showroom);
        return ResponseEntity.ok(saved);
    }
}
