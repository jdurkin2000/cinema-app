package edu.uga.csci4050.cinema.controller.dto;

import edu.uga.csci4050.cinema.type.TicketType;
import jakarta.validation.constraints.Positive;

public class TicketInfoDtos {
    public static class UpdateTicketRequest {
        public TicketType type;

        @Positive 
        public double price;
    }
}
