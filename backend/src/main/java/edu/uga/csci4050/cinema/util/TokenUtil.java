package edu.uga.csci4050.cinema.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class TokenUtil {
    private static final SecureRandom rnd = new SecureRandom();
    public static String newUrlToken(){
        byte[] b = new byte[32]; rnd.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
    public static String sha256(String s){
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(md.digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch(Exception e){ throw new RuntimeException(e); }
    }
}
