package edu.uga.csci4050.cinema.controller.dto;

import jakarta.validation.constraints.*;

public class AuthDtos {
    public static class RegisterRequest {
        @NotBlank public String name;
        @Email @NotBlank public String email;
        @Size(min=8,max=128) public String password;
        public boolean promotionsOptIn;
    }
    public static class LoginRequest {
        @Email @NotBlank public String email;
        @NotBlank public String password;
        public boolean rememberMe;
    }
    public static class ForgotPasswordRequest {
        @Email @NotBlank public String email;
    }
    public static class ResetPasswordRequest {
        @NotBlank public String token;
        @Size(min=8,max=128) public String newPassword;
    }
}
