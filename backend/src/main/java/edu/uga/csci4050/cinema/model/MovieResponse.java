package edu.uga.csci4050.cinema.model;

import java.util.List;
import java.util.stream.Collectors;

public class MovieResponse {
    private List<MovieItem> running, upcoming;

    public MovieResponse(List<MovieItem> movies) {
        var partitioned = movies.stream()
                .collect(Collectors.partitioningBy(MovieItem::isUpcoming));

        this.running = partitioned.getOrDefault(false, List.of());
        this.upcoming = partitioned.getOrDefault(true, List.of());
    }

    public List<MovieItem> getRunning() {
        return running;
    }

    public List<MovieItem> getUpcoming() {
        return upcoming;
    }

    public boolean isEmpty() {
        return (running == null || running.isEmpty()) &&
                (upcoming == null || upcoming.isEmpty());
    }
}
