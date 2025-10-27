package edu.uga.csci4050.cinema.service;

import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.util.CryptoUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class UserService {
    private final SecretKey secretKey;

    public UserService(@Value("${payment.aes-key}") String base64Key) {
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        this.secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
    }

    public User encryptUserInfo(User user) throws Exception {
        String encryptedPassword = CryptoUtils.encrypt(user.getPassword(), secretKey);
        String encryptedAddress = CryptoUtils.encrypt(user.getBillingAddress(), secretKey);

        User encryptedUser;

        return user;
    }
}
