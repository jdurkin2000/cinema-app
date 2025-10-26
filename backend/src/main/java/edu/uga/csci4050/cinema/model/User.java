package edu.uga.csci4050.cinema.model;

import edu.uga.csci4050.cinema.type.PaymentCard;
import edu.uga.csci4050.cinema.type.UserRole;
import edu.uga.csci4050.cinema.type.UserState;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Size;

import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String firstName, lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String billingAddress;
    private UserState status;
    private UserRole role;
    private boolean registeredForPromotions;
    @Size(max = 4, message = "User cannot store more than 4 payment cards")
    private List<PaymentCard> paymentCards;

    public User(String id, String firstName, String lastName, String email,
                String password, String phoneNumber, String billingAddress,
                UserState status, UserRole role, boolean registeredForPromotions,
                List<PaymentCard> paymentCards) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.billingAddress = billingAddress;
        this.status = status;
        this.role = role;
        this.registeredForPromotions = registeredForPromotions;
        this.paymentCards = paymentCards;
    }

    public User(User user, String password, String billingAddress) {
        this(user.id, user.firstName, user.lastName, user.email,
                password, user.phoneNumber, billingAddress,
                user.status, user.role, user.registeredForPromotions,
                user.paymentCards);
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public List<PaymentCard> getPaymentCards() {
        return paymentCards;
    }

    public String getBillingAddress() {
        return billingAddress;
    }

    public UserState getStatus() {
        return status;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isRegisteredForPromotions() {
        return registeredForPromotions;
    }
}
