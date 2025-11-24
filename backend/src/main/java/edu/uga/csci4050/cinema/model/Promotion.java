package edu.uga.csci4050.cinema.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "promotions")
public class Promotion {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;
    
    private LocalDate startDate;
    private LocalDate endDate;
    private int discountPercent;

    public String getId() {
        return id;
    }

    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }

    public void setCode(String code) { this.code = code; }

    public LocalDate getStartDate() { return startDate; }

    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }

    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public int getDiscountPercent() { return discountPercent; }

    public void setDiscountPercent(int discountPercent) { this.discountPercent = discountPercent; }
}
