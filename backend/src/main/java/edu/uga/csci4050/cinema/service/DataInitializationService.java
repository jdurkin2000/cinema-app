package edu.uga.csci4050.cinema.service;

import edu.uga.csci4050.cinema.model.MovieItem;
import edu.uga.csci4050.cinema.repository.MovieRepository;
import edu.uga.csci4050.cinema.type.RatingCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
        // Sample movie 1 - Currently Running
        List<String> genres1 = List.of("Action", "Adventure", "Sci-Fi");
        List<String> cast1 = List.of("Tom Cruise", "Rebecca Ferguson", "Simon Pegg");
        List<String> reviews1 = List.of("Amazing action sequences!", "Great plot twists");
        List<LocalDateTime> showtimes1 = List.of(
            LocalDateTime.of(2024, 1, 15, 14, 0),
            LocalDateTime.of(2024, 1, 15, 17, 0),
            LocalDateTime.of(2024, 1, 15, 20, 0)
        );
        
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
            RatingCode.PG13,
            showtimes1,
            LocalDate.of(2023, 7, 12),
            false
        );
        movieRepository.save(movie1);
        
        // Sample movie 2 - Currently Running
        List<String> genres2 = List.of("Drama", "Romance");
        List<String> cast2 = List.of("Ryan Gosling", "Emma Stone", "John Legend");
        List<String> reviews2 = List.of("Beautiful cinematography", "Amazing musical numbers");
        List<LocalDateTime> showtimes2 = List.of(
            LocalDateTime.of(2024, 1, 15, 15, 30),
            LocalDateTime.of(2024, 1, 15, 18, 30),
            LocalDateTime.of(2024, 1, 15, 21, 30)
        );
        
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
            RatingCode.PG13,
            showtimes2,
            LocalDate.of(2016, 12, 25),
            false
        );
        movieRepository.save(movie2);
        
        // Sample upcoming movie
        List<String> genres3 = List.of("Action", "Thriller");
        List<String> cast3 = List.of("Keanu Reeves", "Halle Berry", "Ian McShane");
        List<String> reviews3 = List.of("Highly anticipated sequel", "John Wick returns!");
        List<LocalDateTime> showtimes3 = List.of(
            LocalDateTime.of(2024, 1, 20, 14, 0),
            LocalDateTime.of(2024, 1, 20, 17, 0),
            LocalDateTime.of(2024, 1, 20, 20, 0)
        );
        
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
            RatingCode.R,
            showtimes3,
            LocalDate.of(2023, 3, 24),
            true
        );
        movieRepository.save(movie3);

        // Sample movie 4 - Currently Running
        List<String> genres4 = List.of("Comedy", "Family");
        List<String> cast4 = List.of("Chris Pratt", "Anya Taylor-Joy", "Charlie Day");
        List<String> reviews4 = List.of("Fun for the whole family", "Great animation");
        List<LocalDateTime> showtimes4 = List.of(
            LocalDateTime.of(2024, 1, 15, 13, 0),
            LocalDateTime.of(2024, 1, 15, 16, 0),
            LocalDateTime.of(2024, 1, 15, 19, 0)
        );
        
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
            RatingCode.PG,
            showtimes4,
            LocalDate.of(2023, 4, 5),
            false
        );
        movieRepository.save(movie4);

        System.out.println("Sample movies initialized successfully!");
    }
}
