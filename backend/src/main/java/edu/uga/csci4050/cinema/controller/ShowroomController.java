package edu.uga.csci4050.cinema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uga.csci4050.cinema.model.Showroom;
import edu.uga.csci4050.cinema.repository.ShowroomRepository;
import edu.uga.csci4050.cinema.type.Showtime;
// import edu.uga.csci4050.cinema.util.HttpUtils;

@RestController
@RequestMapping("/api/showrooms")
public class ShowroomController {
    @Autowired
    ShowroomRepository showroomRepository;

    @GetMapping
    public ResponseEntity<List<Showroom>> getAllShowrooms() {
        // Return 200 with [] when none exist to avoid client 404s
        List<Showroom> all = showroomRepository.findAll();
        return ResponseEntity.ok(all);
    }

    @PostMapping
    public Showroom saveShowrooms(@RequestBody Showroom showroom) {
        return showroomRepository.save(showroom);
    }

    @PostMapping("/{id}/showtimes")
    public ResponseEntity<Showroom> addShowtimeToShowroom(@PathVariable String id, @RequestBody Showtime showtime) {
        return showroomRepository.findById(id)
                .map(showroom -> {
                    // Initialize showtimes list if null to avoid NPE on first insert
                    if (showroom.getShowtimes() == null) {
                        showroom.setShowtimes(new java.util.ArrayList<>());
                    }
                    showroom.getShowtimes().add(showtime);
                    return ResponseEntity.ok(showroomRepository.save(showroom));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/showtimes")
    public ResponseEntity<Showroom> removeShowtimeFromShowroom(@PathVariable String id,
            @RequestBody Showtime showtime) {
        var maybe = showroomRepository.findById(id);
        if (maybe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Showroom showroom = maybe.get();
        if (showroom.getShowtimes() == null) {
            return ResponseEntity.notFound().build();
        }
        boolean removed = showroom.getShowtimes()
                .removeIf(st -> String.valueOf(st.movieId()).equals(String.valueOf(showtime.movieId()))
                        && st.start().equals(showtime.start()));

        if (removed) {
            return ResponseEntity.ok(showroomRepository.save(showroom));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/showtimes")
    public ResponseEntity<Showroom> getShowroomById(@PathVariable String id) {
        // For individual showroom, still return 404 if not found (id-specific request)
        return showroomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
