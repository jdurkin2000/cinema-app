package edu.uga.csci4050.cinema.repository;

import edu.uga.csci4050.cinema.model.MovieItem;
import edu.uga.csci4050.cinema.repository.custom.CustomMovieRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Repository for MovieItem operations.
 * Note: isUpcoming queries removed as that field no longer exists.
 * Use Showtime queries for filtering by show dates.
 */
public interface MovieRepository extends MongoRepository<MovieItem, String>, CustomMovieRepository {
    public List<MovieItem> findByTitle(String title);

    public List<MovieItem> findByGenresContaining(List<String> genres);

    public List<MovieItem> findByTitleAndGenres(String title, List<String> genres);
}
