package edu.uga.csci4050.cinema.model;

import edu.uga.csci4050.cinema.type.PaymentCard;
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
    @Size(max = 4, message = "User cannot store more than 4 payment cards")
    private List<PaymentCard> paymentCards;

    public User(String id, String firstName, String lastName, String email, String password, String phoneNumber, List<PaymentCard> paymentCards) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.paymentCards = paymentCards;
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
}
