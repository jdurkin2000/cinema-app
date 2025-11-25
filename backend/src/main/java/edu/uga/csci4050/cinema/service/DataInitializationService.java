package edu.uga.csci4050.cinema.service;

import edu.uga.csci4050.cinema.model.MovieItem;
import edu.uga.csci4050.cinema.repository.MovieRepository;
import edu.uga.csci4050.cinema.type.RatingCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service to initialize sample data.
 * Note: Showtimes are no longer part of MovieItem.
 * They should be created separately in the Showtime/Showroom subsystem.
 */
@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (movieRepository.count() == 0) {
            initializeSampleMovies();
        }
    }

    private void initializeSampleMovies() {
        // Sample movie 1
        List<String> genres1 = List.of("Action", "Adventure", "Sci-Fi");
        List<String> cast1 = List.of("Tom Cruise", "Rebecca Ferguson", "Simon Pegg");
        List<String> reviews1 = List.of("Amazing action sequences!", "Great plot twists");

        MovieItem movie1 = new MovieItem(
                "Mission Impossible 7",
                genres1,
                cast1,
                "Christopher McQuarrie",
                "Tom Cruise",
                "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity.",
                reviews1,
                "https://image.tmdb.org/t/p/w500/7gKI9hpEMcZUQpNgKrkDzJpbnNS.jpg",
                "https://www.youtube.com/embed/avz06PDqDbM",
                RatingCode.PG13);
        movieRepository.save(movie1);

        // Sample movie 2
        List<String> genres2 = List.of("Drama", "Romance");
        List<String> cast2 = List.of("Ryan Gosling", "Emma Stone", "John Legend");
        List<String> reviews2 = List.of("Beautiful cinematography", "Amazing musical numbers");

        MovieItem movie2 = new MovieItem(
                "La La Land",
                genres2,
                cast2,
                "Damien Chazelle",
                "Fred Berger",
                "A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.",
                reviews2,
                "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
                "https://www.youtube.com/embed/0pdqf4P9MB8",
                RatingCode.PG13);
        movieRepository.save(movie2);

        // Sample movie 3
        List<String> genres3 = List.of("Action", "Thriller");
        List<String> cast3 = List.of("Keanu Reeves", "Halle Berry", "Ian McShane");
        List<String> reviews3 = List.of("Highly anticipated sequel", "John Wick returns!");

        MovieItem movie3 = new MovieItem(
                "John Wick 4",
                genres3,
                cast3,
                "Chad Stahelski",
                "Basil Iwanyk",
                "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
                reviews3,
                "https://image.tmdb.org/t/p/w500/vZloFAK7FmvSqYgK0X2xqQyJx5t.jpg",
                "https://www.youtube.com/embed/qEVUtrk8_B4",
                RatingCode.R);
        movieRepository.save(movie3);

        // Sample movie 4
        List<String> genres4 = List.of("Comedy", "Family");
        List<String> cast4 = List.of("Chris Pratt", "Anya Taylor-Joy", "Charlie Day");
        List<String> reviews4 = List.of("Fun for the whole family", "Great animation");

        MovieItem movie4 = new MovieItem(
                "Super Mario Bros Movie",
                genres4,
                cast4,
                "Aaron Horvath",
                "Chris Meledandri",
                "A Brooklyn plumber named Mario travels through the Mushroom Kingdom with a princess named Peach and an anthropomorphic mushroom named Toad to find Mario's brother, Luigi, and to save the world from a ruthless fire-breathing Koopa named Bowser.",
                reviews4,
                "https://image.tmdb.org/t/p/w500/qNBAXBIQlnPThA3R2bcz3TVr6.jpg",
                "https://www.youtube.com/embed/TnGl01FkMMo",
                RatingCode.PG);
        movieRepository.save(movie4);

        System.out.println("Sample movies initialized successfully!");
        System.out.println("Note: Showtimes should be created separately via the Showroom/Showtime API");
    }
}
