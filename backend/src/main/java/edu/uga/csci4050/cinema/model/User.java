package edu.uga.csci4050.cinema.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    public enum Role { ADMIN, USER }
    public enum Status { INACTIVE, ACTIVE }

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    // BCrypt hash
    private String passwordHash;

    private Role role = Role.USER;
    private Status status = Status.INACTIVE;
    private boolean promotionsOptIn = false;
    private boolean emailVerified = false;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // Email verification & reset (hash + expiry)
    private String emailVerifyTokenHash;
    private Instant emailVerifyExpiry;

    private String resetTokenHash;
    private Instant resetTokenExpiry;

    // Profile
    private Address address; // single address

    // Up to 4 cards
    private List<PaymentCard> paymentCards = new ArrayList<>();

    // Getters/setters omitted for brevity—generate them all.

    public static class Address {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String zip;
        // getters/setters
    }

    public static class PaymentCard {
        private String id;            // UUID
        private String brand;         // Visa/Mastercard etc.
        private String last4;         // for display
        private int expMonth;
        private int expYear;

        // Encrypted at rest
        private String numberEnc;     // base64(AES-GCM)
        private String billingName;
        private Address billingAddress;

        private Instant addedAt = Instant.now();
        // getters/setters
    }
}
