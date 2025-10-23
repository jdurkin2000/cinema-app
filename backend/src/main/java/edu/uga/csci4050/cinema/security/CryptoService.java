package edu.uga.csci4050.cinema.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CryptoService {
    private final byte[] keyBytes;
    private final SecureRandom rnd = new SecureRandom();
    public CryptoService(@Value("${app.crypto.key.base64}") String base64) {
        this.keyBytes = java.util.Base64.getDecoder().decode(base64);
    }
    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[12];
            rnd.nextBytes(iv);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new GCMParameterSpec(128, iv));
            byte[] ct = c.doFinal(plaintext.getBytes());
            byte[] out = new byte[iv.length + ct.length];
            System.arraycopy(iv,0,out,0,iv.length);
            System.arraycopy(ct,0,out,iv.length,ct.length);
            return Base64.getEncoder().encodeToString(out);
        } catch(Exception e){ throw new RuntimeException(e); }
    }
}
