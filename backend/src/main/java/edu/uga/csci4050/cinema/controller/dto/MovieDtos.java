package edu.uga.csci4050.cinema.controller.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * DTOs related to Movie operations (create, update, etc.)
 * 
 * Note: Showtimes, released dates, and upcoming flags have been removed
 * as they are now managed by the Showtime and Showroom subsystems.
 */
public class MovieDtos {

    // ----- Create a new movie -----
    public static class CreateRequest {
        @NotBlank
        public String title;
        public List<String> genres;
        public List<String> cast;
        public String director;
        public String producer;
        public String synopsis;
        public List<String> reviews;

        @NotBlank
        public String poster; // required URL
        @NotBlank
        public String trailer; // required URL

        @NotBlank
        public String rating; // e.g. "PG-13", "R", "G"
    }

    // ----- Update an existing movie -----
    public static class UpdateRequest {
        @NotBlank
        public String id; // existing movie ID
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
    }

    // ----- Optional: Response DTO (if you ever want a custom response format)
    // -----
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
    }
}
