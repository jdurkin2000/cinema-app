package edu.uga.csci4050.cinema.model;

import edu.uga.csci4050.cinema.type.RatingCode;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/*
For each movie, the system must record movie title, category, cast,
director, producer, synopsis, reviews, trailer picture and video,
MPAA-US film rating code [1].

Note: Show dates/times are now handled by the Showtime and Showroom models.
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
    private String poster; // URL to poster image
    private String trailer; // URL to trailer video
    private RatingCode rating;

    // Default constructor required for MongoDB
    public MovieItem() {
    }

    public MovieItem(String title, List<String> genres,
            List<String> cast, String director, String producer,
            String synopsis, List<String> reviews, String poster,
            String trailer, RatingCode rating) {
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
    }

    public String getId() {
        return id;
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

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();

        sb.append("=== Movie Details ===\n");
        sb.append("ID: ").append(id).append("\n");
        sb.append("Title: ").append(title).append("\n");
        sb.append("Rating: ").append(rating != null ? rating : "N/A").append("\n");

        sb.append("Genres: ").append(formatList(genres)).append("\n");
        sb.append("Cast: ").append(formatList(cast)).append("\n");

        sb.append("Director: ").append(director != null ? director : "N/A").append("\n");
        sb.append("Producer: ").append(producer != null ? producer : "N/A").append("\n");

        sb.append("Synopsis: ").append(synopsis != null ? synopsis : "N/A").append("\n");
        sb.append("Reviews: ").append(formatList(reviews)).append("\n");

        sb.append("Poster URL: ").append(poster != null ? poster : "N/A").append("\n");
        sb.append("Trailer URL: ").append(trailer != null ? trailer : "N/A").append("\n");

        sb.append("=====================");

        return sb.toString();
    }

    private static String formatList(List<String> list) {
        return (list != null && !list.isEmpty()) ? String.join(", ", list) : "N/A";
    }

    // Setters for MongoDB deserialization
    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public void setCast(List<String> cast) {
        this.cast = cast;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public void setProducer(String producer) {
        this.producer = producer;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public void setReviews(List<String> reviews) {
        this.reviews = reviews;
    }

    public void setPoster(String poster) {
        this.poster = poster;
    }

    public void setTrailer(String trailer) {
        this.trailer = trailer;
    }

    public void setRating(RatingCode rating) {
        this.rating = rating;
    }
}
