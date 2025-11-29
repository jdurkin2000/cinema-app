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
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.uga.csci4050.cinema.repository.MovieRepository;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    MovieRepository movieRepository;

    @Autowired
    MongoTemplate mongoTemplate;

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
     * Upcoming movies: movies NOT currently showing in any showroom.
     * Determined solely by Showrooms' embedded showtimes list (no MovieItem fields
     * involved).
     * A movie is considered "currently showing" if any showroom has a showtime with
     * start <= now.
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<MovieItem>> getUpcomingMovies() {
        java.time.Instant now = java.time.Instant.now();

        // Find showrooms that have at least one showtime with start <= now
        Query activeShowroomsQuery = new Query(
                Criteria.where("showtimes").elemMatch(Criteria.where("start").lte(now)));

        List<org.bson.Document> activeShowrooms = mongoTemplate.find(activeShowroomsQuery, org.bson.Document.class,
                "showrooms");

        java.util.Set<String> activeMovieIds = new java.util.HashSet<>();
        for (org.bson.Document showroom : activeShowrooms) {
            Object showtimesObj = showroom.get("showtimes");
            if (showtimesObj instanceof java.util.List<?> list) {
                for (Object o : list) {
                    if (o instanceof org.bson.Document st) {
                        Object start = st.get("start");
                        Object movieId = st.get("movieId");
                        if (start instanceof java.util.Date && movieId instanceof String) {
                            java.time.Instant stInstant = ((java.util.Date) start).toInstant();
                            if (!stInstant.isAfter(now)) { // start <= now
                                activeMovieIds.add((String) movieId);
                            }
                        }
                    }
                }
            }
        }

        // Upcoming = movies whose _id not in activeMovieIds (or all movies if none
        // active)
        Query moviesQuery = new Query();
        if (!activeMovieIds.isEmpty()) {
            // Convert string IDs to ObjectId for comparison with _id
            java.util.List<org.bson.types.ObjectId> excludeIds = new java.util.ArrayList<>();
            for (String idStr : activeMovieIds) {
                try {
                    excludeIds.add(new org.bson.types.ObjectId(idStr));
                } catch (IllegalArgumentException ignored) {
                    // skip invalid ObjectId strings
                }
            }
            if (!excludeIds.isEmpty()) {
                moviesQuery.addCriteria(Criteria.where("_id").nin(excludeIds));
            }
        }
        moviesQuery.limit(50);
        moviesQuery.fields().include("title").include("poster").include("genres").include("synopsis").include("rating");

        List<MovieItem> upcoming = mongoTemplate.find(moviesQuery, MovieItem.class, "movies");
        // Always return 200 with list (possibly empty) so frontend can decide rendering
        return ResponseEntity.ok(upcoming);
    }

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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMovie(@PathVariable String id) {
        return movieRepository.findById(id)
                .map(m -> {
                    movieRepository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
