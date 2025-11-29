package edu.uga.csci4050.cinema.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import edu.uga.csci4050.cinema.type.TicketType;

@Document(collection = "ticket_prices")
public class TicketInfo {
    @Id
    private String id;

    private TicketType type;
    private double price;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    // Use standard Jackson property name "type" for consistency with frontend
    @JsonProperty("type")
    public TicketType getType() {
        return type;
    }

    @JsonProperty("type")
    public void setType(TicketType type) {
        this.type = type;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
