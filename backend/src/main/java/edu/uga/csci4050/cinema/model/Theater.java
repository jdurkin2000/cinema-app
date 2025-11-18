package edu.uga.csci4050.cinema.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="theaters")
public class Theater {
    @Id
    private String id;

    private String theaterName;
    private String address;
}
