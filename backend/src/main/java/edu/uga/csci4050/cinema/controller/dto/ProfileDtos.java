package edu.uga.csci4050.cinema.controller.dto;

import edu.uga.csci4050.cinema.model.User;
import jakarta.validation.constraints.*;
import java.util.UUID;

public class ProfileDtos {

    public static class UpdateProfileRequest {
        @NotBlank public String firstLastName; // maps to User.name
        public Boolean promotionsOptIn;        // toggle
        // Single address (optional)
        public User.Address address;
    }

    public static class ChangePasswordRequest {
        @NotBlank public String currentPassword;
        @Size(min=8,max=128) public String newPassword;
    }

    public static class AddCardRequest {
        @NotBlank public String number; // PAN
        @Min(1) @Max(12) public int expMonth;
        @Min(2024) @Max(2100) public int expYear;
        @NotBlank public String billingName;
        public User.Address billingAddress;
    }

    public static class RemoveCardRequest {
        @NotBlank public String cardId;
    }

    public static String newCardId(){ return UUID.randomUUID().toString(); }
}
