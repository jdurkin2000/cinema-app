package edu.uga.csci4050.cinema.controller;

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

    @GetMapping("/currently-running")
    public ResponseEntity<List<MovieItem>> getCurrentlyRunningMovies() {
        List<MovieItem> movies = movieRepository.findByIsUpcoming(false);
        return HttpUtils.buildResponseEntity(movies, "No currently running movies found.");
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MovieItem>> getUpcomingMovies() {
        List<MovieItem> movies = movieRepository.findByIsUpcoming(true);
        return HttpUtils.buildResponseEntity(movies, "No upcoming movies found.");
    }
}
