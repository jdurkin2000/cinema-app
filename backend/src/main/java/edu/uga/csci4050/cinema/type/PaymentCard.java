package edu.uga.csci4050.cinema.type;

import java.time.LocalDate;

public class PaymentCard {
    private String cardNumber;
    private String expirationDate;
    private boolean isDefault;

    public PaymentCard() {
        cardNumber = null;
        expirationDate = null;
        isDefault = false;
    }

    public PaymentCard(String cardNumber, String expirationDate, boolean isDefault) {
        this.cardNumber = cardNumber;
        this.expirationDate = expirationDate;
        this.isDefault = isDefault;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
