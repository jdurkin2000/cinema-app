package edu.uga.csci4050.cinema.type;

import java.time.LocalDate;

public class PaymentCard {
    private String cardNumber;
    private LocalDate expirationDate;
    private String billingAddress;
    private boolean isDefault;

    public PaymentCard() {
        cardNumber = null;
        expirationDate = null;
        billingAddress = null;
        isDefault = false;
    }

    public PaymentCard(String cardNumber, LocalDate expirationDate, String billingAddress, boolean isDefault) {
        // Hash the card number for security
        this.cardNumber = cardNumber;
        this.expirationDate = expirationDate;
        this.billingAddress = billingAddress;
        this.isDefault = isDefault;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
