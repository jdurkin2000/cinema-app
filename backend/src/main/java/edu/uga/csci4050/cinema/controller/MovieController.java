package edu.uga.csci4050.cinema.controller;

// DTOs
import edu.uga.csci4050.cinema.controller.dto.MovieDtos;

// validation + security
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

// HTTP
import org.springframework.http.HttpStatus;

// rating enum
import edu.uga.csci4050.cinema.type.RatingCode;

import edu.uga.csci4050.cinema.model.MovieItem;
import edu.uga.csci4050.cinema.util.HttpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.uga.csci4050.cinema.repository.MovieRepository;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    MovieRepository movieRepository;

    @GetMapping("/{id}")
    public ResponseEntity<MovieItem> getMovie(@PathVariable String id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<MovieItem>> getMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<String> genres) {

        System.out.println("Searching for movies");
        List<MovieItem> collection = movieRepository.searchMovies(title, genres);
        System.out.println("Returning movies now");

        return HttpUtils.buildResponseEntity(collection,
                "Could not find movies that match the applied filters.");
    }

    /**
     * Note: Currently running and upcoming movie queries have been removed.
     * These should now be determined by querying the Showtime/Showroom subsystems.
     * Frontend should query showtimes to determine which movies are currently
     * showing or upcoming.
     */

    // ---------- Create Movie ----------
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieItem> createMovie(@Valid @RequestBody MovieDtos.CreateRequest dto) {
        MovieItem m = new MovieItem();

        // Map fields
        m.setTitle(dto.title);
        m.setGenres(dto.genres);
        m.setCast(dto.cast);
        m.setDirector(dto.director);
        m.setProducer(dto.producer);
        m.setSynopsis(dto.synopsis);
        m.setReviews(dto.reviews);
        m.setPoster(dto.poster);
        m.setTrailer(dto.trailer);

        // Rating mapping "PG-13" -> RatingCode.PG13 (fallback to NR if unknown)
        if (dto.rating != null) {
            String r = dto.rating.trim().toUpperCase().replace("-", "").replace(" ", "");
            try {
                // handle common cases
                if ("PG13".equals(r)) {
                    m.setRating(RatingCode.PG13);
                } else if ("NC17".equals(r)) {
                    m.setRating(RatingCode.NC17);
                } else {
                    // direct map: G, PG, R, NR, etc.
                    m.setRating(RatingCode.valueOf(r));
                }
            } catch (Exception ignored) {
                m.setRating(RatingCode.NR);
            }
        }

        MovieItem saved = movieRepository.save(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieItem> updateMovie(@PathVariable String id,
            @Valid @RequestBody MovieDtos.CreateRequest dto) {
        return movieRepository.findById(id)
                .map(m -> {
                    m.setTitle(dto.title);
                    m.setGenres(dto.genres);
                    m.setCast(dto.cast);
                    m.setDirector(dto.director);
                    m.setProducer(dto.producer);
                    m.setSynopsis(dto.synopsis);
                    m.setReviews(dto.reviews);
                    m.setPoster(dto.poster);
                    m.setTrailer(dto.trailer);
                    if (dto.rating != null) {
                        String r = dto.rating.trim().toUpperCase().replace("-", "").replace(" ", "");
                        try {
                            if ("PG13".equals(r))
                                m.setRating(RatingCode.PG13);
                            else if ("NC17".equals(r))
                                m.setRating(RatingCode.NC17);
                            else
                                m.setRating(RatingCode.valueOf(r));
                        } catch (Exception ignored) {
                            m.setRating(RatingCode.NR);
                        }
                    }
                    return ResponseEntity.ok(movieRepository.save(m));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
