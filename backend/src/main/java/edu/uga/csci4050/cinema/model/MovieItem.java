package edu.uga.csci4050.cinema.model;

import edu.uga.csci4050.cinema.types.RatingCode;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
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
    private String genre; // Does this need to be an array??
    private List<String> cast;
    private String director;
    private String producer;
    private String synopsis;
    private List<String> reviews;
    private String poster; // I think this and trailer will be encoded as urls
    private String trailer;
    private RatingCode rating;
    private List<LocalDateTime> showtimes;

    public MovieItem(String id, String title, String genre,
                     List<String> cast, String director, String producer,
                     String synopsis, List<String> reviews, String poster,
                     String trailer, RatingCode rating, List<LocalDateTime> showtimes) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.cast = cast;
        this.director = director;
        this.producer = producer;
        this.synopsis = synopsis;
        this.reviews = reviews;
        this.poster = poster;
        this.trailer = trailer;
        this.rating = rating;
        this.showtimes = showtimes;
    }

    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genre;
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
}
