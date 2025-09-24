package edu.uga.csci4050.cinema;

import edu.uga.csci4050.cinema.model.MovieItem;
import edu.uga.csci4050.cinema.repository.MovieRepository;
import edu.uga.csci4050.cinema.type.RatingCode;
import info.movito.themoviedbapi.TmdbApi;
import info.movito.themoviedbapi.TmdbMovieLists;
import info.movito.themoviedbapi.TmdbMovies;
import info.movito.themoviedbapi.model.core.Genre;
import info.movito.themoviedbapi.model.core.Movie;
import info.movito.themoviedbapi.model.core.Review;
import info.movito.themoviedbapi.model.core.video.Video;
import info.movito.themoviedbapi.model.movies.Cast;
import info.movito.themoviedbapi.model.movies.Crew;
import info.movito.themoviedbapi.model.movies.MovieDb;
import info.movito.themoviedbapi.tools.TmdbException;
import info.movito.themoviedbapi.tools.appendtoresponse.MovieAppendToResponse;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Random;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MovieAPITests {
    @Autowired
    MovieRepository movieRepository;

    final String readAccessToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMWIxZWFlYzc4YzE2MDMxOTczNGRkNzFjNzZjNGUxNyIsIm5iZiI6MTc1ODU4MTc4OS44MDQ5OTk4LCJzdWIiOiI2OGQxZDQxZDIxNjJmZDBlZjNjZWNjMTYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.50NIxg-82nAgXLTfItZdedVOXXCwPm0mg6C7Bz7-oyY";
    final String apiKey = "21b1eaec78c160319734dd71c76c4e17";

    TmdbApi tmdbApi;
    String baseImageUrl;

    @BeforeAll
    void init() throws TmdbException {
        tmdbApi = new TmdbApi(readAccessToken);
        baseImageUrl = tmdbApi.getConfiguration().getDetails().getImageConfig().getBaseUrl();
        baseImageUrl = baseImageUrl.concat("original");
    }

    @Test
    void getMongoDBCompatibleMovies() throws TmdbException {
        TmdbMovies movies = tmdbApi.getMovies();

        TmdbMovieLists lists = tmdbApi.getMovieLists();
        List<Movie> nowPlaying = lists.getNowPlaying("en-US", 0, "US")
                .getResults().stream().filter(item -> !item.getAdult()).toList();
        List<Movie> upcoming = lists.getUpcoming("en-US", 0, "US")
                .getResults().stream().filter(item -> !item.getAdult()).toList();

        List<MovieDb> nowPlayingDb = getDbList(nowPlaying, movies);
        List<MovieDb> upcomingDb = getDbList(upcoming, movies);

        List<MovieItem> nowPlayingMovies = nowPlayingDb.stream().map(db -> convertToItem(db, false))
                .filter(movie -> !invalidMovie(movie)).toList();
        List<MovieItem> upcomingMovies = upcomingDb.stream().map(db -> convertToItem(db, true))
                .filter(movie -> !invalidMovie(movie)).toList();

        System.out.println("Saving all movies to database...");

        List<MovieItem> merged = Stream.concat(nowPlayingMovies.stream(), upcomingMovies.stream()).toList();
        movieRepository.saveAll(merged);

        System.out.println("Movies have been uploaded to mongodb");

//        System.out.println("Now Playing length: " + nowPlayingDb.size() + "\nUpcoming Length: " + upcomingDb.size());
//        System.out.println("Obtained movies:\n");
//        nowPlayingMovies.forEach(System.out::println);
//        upcomingMovies.forEach(System.out::println);
    }

    List<MovieDb> getDbList(List<Movie> movies, TmdbMovies db) {
        List<MovieDb> movieDb = new ArrayList<>(movies.size());
        for (Movie movie : movies) {
            MovieDb details = null;
            try {
                details = db.getDetails(movie.getId(), "en-US",
                        MovieAppendToResponse.CREDITS,
                        MovieAppendToResponse.REVIEWS, MovieAppendToResponse.VIDEOS,
                        MovieAppendToResponse.RELEASE_DATES, MovieAppendToResponse.LISTS);
                movieDb.add(details);
            } catch (TmdbException ignored) {
            }
        }

        return movieDb;
    }

    boolean invalidMovie(MovieItem item) {
        return item == null || item.getTitle() == null || item.getTitle().isBlank() ||
                item.getGenres() == null || item.getGenres().isEmpty() || item.getCast() == null ||
                item.getCast().isEmpty() || item.getDirector() == null || item.getDirector().isBlank() ||
                item.getProducer() == null || item.getProducer().isBlank() || item.getSynopsis() == null ||
                item.getSynopsis().isBlank() || item.getReviews() == null || item.getReviews().isEmpty() ||
                item.getPoster() == null || item.getPoster().isBlank() || item.getTrailer() == null ||
                item.getTrailer().isBlank() || item.getRating() == null || item.getShowtimes() == null ||
                item.getShowtimes().isEmpty() || item.getReleased() == null ||
                item.getReleased() == LocalDate.EPOCH || item.getRating() == RatingCode.NR;
    }

    MovieItem convertToItem(MovieDb movie, boolean isUpcoming) {
        String title = movie.getTitle();
        List<String> genres = movie.getGenres().stream().map(Genre::getName).toList();
        List<String> cast = movie.getCredits().getCast().stream().map(Cast::getName).toList();
        String director = movie.getCredits().getCrew().stream()
                .filter(crew -> crew.getJob().equals("Director"))
                .findFirst().orElse(new Crew()).getName();
        String producer = movie.getCredits().getCrew().stream()
                .filter(crew -> crew.getJob().equals("Producer"))
                .findFirst().orElse(new Crew()).getName();
        String synopsis = movie.getOverview();
        List<String> reviews = movie.getReviews().getResults().stream().map(Review::getContent).toList();

        String poster = baseImageUrl + movie.getPosterPath();
        String trailer = "https://www.youtube.com/embed/" +
                movie.getVideos().getResults().stream()
                        .filter(vid -> vid.getType().equals("Trailer") && vid.getSite().equals("YouTube"))
                        .findFirst().orElse(new Video()).getKey();

        String ratingStr;
        try {
            ratingStr = getCertification(movie);
        } catch (NoSuchElementException e) {
            ratingStr = "Unknown";
        }
        RatingCode rating = switch (ratingStr) {
            case "G" -> RatingCode.G;
            case "PG" -> RatingCode.PG;
            case "PG-13" -> RatingCode.PG13;
            case "R" -> RatingCode.R;
            case "NC-17" -> RatingCode.NC17;
            default -> RatingCode.NR;
        };
        List<LocalDateTime> showtimes = generateRandomShowtimes();
        LocalDate released = LocalDate.parse(movie.getReleaseDate());

        return new MovieItem(title, genres, cast, director, producer, synopsis,
                reviews, poster, trailer, rating, showtimes, released, isUpcoming);
    }

    String getCertification(MovieDb movie) {
        return movie.getReleaseDates().getResults().stream()
                .filter(item -> item.getIso31661().equals("US"))
                .findFirst().orElseThrow()
                .getReleaseDates().stream().findFirst()
                .orElseThrow().getCertification();
    }

    List<LocalDateTime> generateRandomShowtimes() {
        Random rand = new Random();

        LocalDateTime now = LocalDateTime.now();
        int listLen = rand.nextInt(4, 20);
        int[] months = rand.ints(listLen, now.getMonthValue(), 13).toArray();
        int[] days = rand.ints(listLen, 1, 29).toArray();
        int[] hours = rand.ints(listLen, 8, 24).toArray();
        int[] minutes = rand.ints(listLen, 0, 4).toArray();

        return IntStream.range(0, listLen)
                .mapToObj(i -> LocalDateTime.of(now.getYear(), months[i], days[i], hours[i], minutes[i] * 15))
                .filter(time -> time.isAfter(now))
                .sorted()
                .toList();
    }
}
