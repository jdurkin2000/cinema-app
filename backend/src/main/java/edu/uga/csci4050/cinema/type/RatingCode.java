package edu.uga.csci4050.cinema.type;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum RatingCode {
    G,
    PG,
    @JsonProperty("PG-13")
    PG13,
    R,
    @JsonProperty("NC-17")
    NC17,
    NR
}
