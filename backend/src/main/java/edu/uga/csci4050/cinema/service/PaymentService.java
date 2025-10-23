package edu.uga.csci4050.cinema.service;

import edu.uga.csci4050.cinema.type.PaymentCard;
import edu.uga.csci4050.cinema.util.CryptoUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class PaymentService {

    private final SecretKey secretKey;

    public PaymentService(@Value("${payment.aes-key}") String base64Key) {
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        this.secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
    }

    public PaymentCard encryptCard(PaymentCard card) throws Exception {
        card.setCardNumber(CryptoUtils.encrypt(card.getCardNumber(), secretKey));
        //card.setExpirationDate(CryptoUtils.encrypt(card.getExpirationDate(), secretKey));
        return card;
    }

    public PaymentCard decryptCard(PaymentCard card) throws Exception {
        card.setCardNumber(CryptoUtils.decrypt(card.getCardNumber(), secretKey));
        //card.setExpirationDate(CryptoUtils.decrypt(card.getExpirationDate(), secretKey));
        return card;
    }
}
