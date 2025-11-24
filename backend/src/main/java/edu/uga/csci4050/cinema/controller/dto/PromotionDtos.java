package edu.uga.csci4050.cinema.controller.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class PromotionDtos {

    public static class CreatePromotionRequest {
        @Size(min = 1, max = 6)
        public String code;

        @NotNull
        public LocalDate startDate;

        @NotNull
        public LocalDate endDate;

        @Min(1)
        @Max(100)
        public int discountPercent;
    }
}
