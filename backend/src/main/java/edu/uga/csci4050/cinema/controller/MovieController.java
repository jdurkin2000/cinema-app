package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.model.MovieItem;
import edu.uga.csci4050.cinema.util.HttpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.uga.csci4050.cinema.repository.MovieRepository;

import java.time.LocalDateTime;
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
    public ResponseEntity<List<MovieItem>> getMoviesByTitle(@RequestParam String title) {
        return HttpUtils.buildResponseEntity(
                movieRepository.findByTitle(title), "Could not find movie with title " + title);
    }

    @GetMapping
    public ResponseEntity<List<MovieItem>> getMoviesByGenre(@RequestParam String genre) {
        return HttpUtils.buildResponseEntity(
                movieRepository.findByGenre(genre), "Could not find any movies with genre " + genre);
    }

    @GetMapping
    public ResponseEntity<List<MovieItem>> getMoviesByShowtime(@RequestParam String showtime) {
        return HttpUtils.buildResponseEntity(
                movieRepository.findByShowtimes(LocalDateTime.parse(showtime)),
                "Could not find any movies with showtime " + showtime);
    }

    @GetMapping
    public ResponseEntity<List<MovieItem>> getAllMovies() {
        return HttpUtils.buildResponseEntity(
                movieRepository.findAll(),  "No movies are currently stored in database");
    }
}
