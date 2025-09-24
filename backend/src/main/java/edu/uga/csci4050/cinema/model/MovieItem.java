package edu.uga.csci4050.cinema.model;

import edu.uga.csci4050.cinema.type.RatingCode;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/*
For each movie, the system must record movie title, category, cast,
director, producer, synopsis, reviews, trailer picture and video,
MPAA-US film rating code [1], and show dates and times.
 */

@Document(collection = "movies")
public class MovieItem {
    @Id
    private String id;

    private String title;
    private List<String> genres;
    private List<String> cast;
    private String director;
    private String producer;
    private String synopsis;
    private List<String> reviews;
    private String poster; // I think this and trailer will be encoded as urls
    private String trailer;
    private RatingCode rating;
    private List<LocalDateTime> showtimes;
    private LocalDate released;
    private boolean isUpcoming;

    public MovieItem(String title, List<String> genres,
                     List<String> cast, String director, String producer,
                     String synopsis, List<String> reviews, String poster,
                     String trailer, RatingCode rating, List<LocalDateTime> showtimes,
                     LocalDate released, boolean isUpcoming) {
        this.title = title;
        this.genres = genres;
        this.cast = cast;
        this.director = director;
        this.producer = producer;
        this.synopsis = synopsis;
        this.reviews = reviews;
        this.poster = poster;
        this.trailer = trailer;
        this.rating = rating;
        this.showtimes = showtimes;
        this.released = released;
        this.isUpcoming = isUpcoming;
    }

    public String getTitle() {
        return title;
    }

    public List<String> getGenres() {
        return genres;
    }

    public List<String> getCast() {
        return cast;
    }

    public String getDirector() {
        return director;
    }

    public String getProducer() {
        return producer;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public List<String> getReviews() {
        return reviews;
    }

    public String getPoster() {
        return poster;
    }

    public String getTrailer() {
        return trailer;
    }

    public RatingCode getRating() {
        return rating;
    }

    public List<LocalDateTime> getShowtimes() {
        return showtimes;
    }

    public LocalDate getReleased() {
        return released;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        sb.append("=== Movie Details ===\n");
        sb.append("ID: ").append(id).append("\n");
        sb.append("Title: ").append(title).append("\n");
        sb.append("Rating: ").append(rating != null ? rating : "N/A").append("\n");
        sb.append("Released: ").append(released != null ? released.format(dateFormat) : "N/A").append("\n");

        sb.append("Genres: ").append(formatList(genres)).append("\n");
        sb.append("Cast: ").append(formatList(cast)).append("\n");

        sb.append("Director: ").append(director != null ? director : "N/A").append("\n");
        sb.append("Producer: ").append(producer != null ? producer : "N/A").append("\n");

        sb.append("Synopsis: ").append(synopsis != null ? synopsis : "N/A").append("\n");
        sb.append("Reviews: ").append(formatList(reviews)).append("\n");

        sb.append("Poster URL: ").append(poster != null ? poster : "N/A").append("\n");
        sb.append("Trailer URL: ").append(trailer != null ? trailer : "N/A").append("\n");

        if (showtimes != null && !showtimes.isEmpty()) {
            sb.append("Showtimes:\n");
            for (var time : showtimes) {
                sb.append("  - ").append(time.format(dateTimeFormat)).append("\n");
            }
        } else {
            sb.append("Showtimes: N/A\n");
        }

        sb.append("Is Upcoming: ").append(isUpcoming).append("\n");

        sb.append("=====================");

        return sb.toString();
    }

    private static String formatList(List<String> list) {
        return (list != null && !list.isEmpty()) ? String.join(", ", list) : "N/A";
    }

    public boolean isUpcoming() {
        return isUpcoming;
    }
}
