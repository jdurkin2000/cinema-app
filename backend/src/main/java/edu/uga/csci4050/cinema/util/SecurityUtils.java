package edu.uga.csci4050.cinema.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class SecurityUtils {
    private final static BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public static String hashString(String rawData) {
        return encoder.encode(rawData);
    }

    public static boolean matchesHash(String rawData, String hashedData) {
        return encoder.matches(rawData, hashedData);
    }
}
