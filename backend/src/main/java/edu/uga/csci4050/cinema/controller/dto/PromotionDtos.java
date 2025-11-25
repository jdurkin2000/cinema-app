package edu.uga.csci4050.cinema.controller.dto;

import jakarta.validation.constraints.*;

/**
 * DTOs for Promotion operations.
 * 
 * Note: Dates are provided as strings and converted to Instant by the
 * controller
 * using DateTimeUtil to ensure proper timezone handling.
 */
public class PromotionDtos {

    public static class CreatePromotionRequest {
        @Size(min = 1, max = 6)
        public String code;

        @NotNull
        public String startDate; // Format: "yyyy-MM-dd"

        @NotNull
        public String endDate; // Format: "yyyy-MM-dd"

        @Min(1)
        @Max(100)
        public int discountPercent;
    }
}
