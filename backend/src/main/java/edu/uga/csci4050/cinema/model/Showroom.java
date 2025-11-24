package edu.uga.csci4050.cinema.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import edu.uga.csci4050.cinema.type.Showtime;

@Document(collection = "showrooms")
public class Showroom {
    @Id
    private String id;

    private List<Showtime> showtimes;

    public String getId() {return id;}
    public void setId(String id) {this.id = id;}

    public List<Showtime> getShowtimes() {return this.showtimes;}
    public void setShowtimes(List<Showtime> showtimes) {this.showtimes = showtimes;}
}
