package edu.uga.csci4050.cinema.repository.custom;

import edu.uga.csci4050.cinema.model.MovieItem;

import java.util.List;

public interface CustomMovieRepository {
    List<MovieItem> searchMovies(String title, List<String> genres);
}
