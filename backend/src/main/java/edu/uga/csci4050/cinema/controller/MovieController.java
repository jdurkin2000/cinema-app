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
    public ResponseEntity<List<MovieItem>> getMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String showtime) {

        if (title != null) {
            return HttpUtils.buildResponseEntity(
                    movieRepository.findByTitle(title),
                    "Could not find movie with title " + title);
        }

        if (genre != null) {
            return HttpUtils.buildResponseEntity(
                    movieRepository.findByGenre(genre),
                    "Could not find any movies with genre " + genre);
        }

        if (showtime != null) {
            return HttpUtils.buildResponseEntity(
                    movieRepository.findByShowtimes(LocalDateTime.parse(showtime)),
                    "Could not find any movies with showtime " + showtime);
        }

        return HttpUtils.buildResponseEntity(
                movieRepository.findAll(),
                "No movies are currently stored in database");
    }

}
