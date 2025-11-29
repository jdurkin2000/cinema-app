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
    public enum Status { INACTIVE, ACTIVE, SUSPENDED }

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

    // Email verification & reset
    private String emailVerifyTokenHash;
    private Instant emailVerifyExpiry;

    private String resetTokenHash;
    private Instant resetTokenExpiry;

    // Profile
    private Address address; // single address

    // Up to 4 cards
    private List<PaymentCard> paymentCards = new ArrayList<>();

    // ===== Getters/Setters =====
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public boolean isPromotionsOptIn() { return promotionsOptIn; }
    public void setPromotionsOptIn(boolean promotionsOptIn) { this.promotionsOptIn = promotionsOptIn; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getEmailVerifyTokenHash() { return emailVerifyTokenHash; }
    public void setEmailVerifyTokenHash(String emailVerifyTokenHash) { this.emailVerifyTokenHash = emailVerifyTokenHash; }

    public Instant getEmailVerifyExpiry() { return emailVerifyExpiry; }
    public void setEmailVerifyExpiry(Instant emailVerifyExpiry) { this.emailVerifyExpiry = emailVerifyExpiry; }

    public String getResetTokenHash() { return resetTokenHash; }
    public void setResetTokenHash(String resetTokenHash) { this.resetTokenHash = resetTokenHash; }

    public Instant getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(Instant resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }

    public List<PaymentCard> getPaymentCards() { return paymentCards; }
    public void setPaymentCards(List<PaymentCard> paymentCards) { this.paymentCards = paymentCards; }

    // ===== Nested types with getters/setters =====
    public static class Address {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String zip;

        public String getLine1() { return line1; }
        public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; }
        public void setLine2(String line2) { this.line2 = line2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getZip() { return zip; }
        public void setZip(String zip) { this.zip = zip; }
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

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getBrand() { return brand; }
        public void setBrand(String brand) { this.brand = brand; }
        public String getLast4() { return last4; }
        public void setLast4(String last4) { this.last4 = last4; }
        public int getExpMonth() { return expMonth; }
        public void setExpMonth(int expMonth) { this.expMonth = expMonth; }
        public int getExpYear() { return expYear; }
        public void setExpYear(int expYear) { this.expYear = expYear; }
        public String getNumberEnc() { return numberEnc; }
        public void setNumberEnc(String numberEnc) { this.numberEnc = numberEnc; }
        public String getBillingName() { return billingName; }
        public void setBillingName(String billingName) { this.billingName = billingName; }
        public Address getBillingAddress() { return billingAddress; }
        public void setBillingAddress(Address billingAddress) { this.billingAddress = billingAddress; }
        public Instant getAddedAt() { return addedAt; }
        public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
    }
}
