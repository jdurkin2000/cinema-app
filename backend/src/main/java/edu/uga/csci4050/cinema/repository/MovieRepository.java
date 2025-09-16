package edu.uga.csci4050.cinema.repository;

import edu.uga.csci4050.cinema.model.MovieItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MovieRepository extends MongoRepository<MovieItem, String> {
    public Optional<MovieItem> findFirstByTitle(String title);
    public List<MovieItem> findByTitle(String title);

    public List<MovieItem> findByGenre(String genre);

    public Optional<MovieItem> findFirstByShowtimes(LocalDateTime showtime);
    public List<MovieItem> findByShowtimes(LocalDateTime showtime);
}
