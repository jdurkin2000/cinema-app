package edu.uga.csci4050.cinema.controller.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs related to Movie operations (create, update, etc.)
 * 
 * Follows the same structure as ProfileDtos.java:
 * - Single container class with public static inner DTOs
 * - Public fields with validation annotations
 */
public class MovieDtos {

    // ----- Create a new movie -----
    public static class CreateRequest {
        @NotBlank public String title;
        public List<String> genres;
        public List<String> cast;
        public String director;
        public String producer;
        public String synopsis;
        public List<String> reviews;

        @NotBlank public String poster;   // required URL
        @NotBlank public String trailer;  // required URL

        @NotBlank public String rating;   // e.g. "PG-13", "R", "G"

        public List<LocalDateTime> showtimes;
        public LocalDate released;
        public Boolean upcoming;
    }

    // ----- Update an existing movie -----
    public static class UpdateRequest {
        @NotBlank public String id;       // existing movie ID
        public String title;
        public List<String> genres;
        public List<String> cast;
        public String director;
        public String producer;
        public String synopsis;
        public List<String> reviews;
        public String poster;
        public String trailer;
        public String rating;
        public List<LocalDateTime> showtimes;
        public LocalDate released;
        public Boolean upcoming;
    }

    // ----- Optional: Response DTO (if you ever want a custom response format) -----
    public static class Response {
        public String id;
        public String title;
        public List<String> genres;
        public List<String> cast;
        public String director;
        public String producer;
        public String synopsis;
        public List<String> reviews;
        public String poster;
        public String trailer;
        public String rating;
        public List<LocalDateTime> showtimes;
        public LocalDate released;
        public Boolean upcoming;
    }
}
