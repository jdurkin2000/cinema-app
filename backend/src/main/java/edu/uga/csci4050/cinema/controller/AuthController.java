package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.controller.dto.AuthDtos.*;
import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.UserRepository;
import edu.uga.csci4050.cinema.security.JwtService;
import edu.uga.csci4050.cinema.service.MailService;
import edu.uga.csci4050.cinema.util.TokenUtil;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final MailService mail;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt, MailService mail) {
        this.users = users; this.encoder = encoder; this.jwt = jwt; this.mail = mail;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest body){
        if (users.existsByEmail(body.email)) {
            return ResponseEntity.badRequest().body(Map.of("message","Email already registered"));
        }
        var u = new User();
        u.setName(body.name);
        u.setEmail(body.email.toLowerCase());
        u.setPasswordHash(encoder.encode(body.password));
        u.setPromotionsOptIn(body.promotionsOptIn);
        u.setRole(User.Role.USER);
        u.setStatus(User.Status.INACTIVE);
        // verification token
        String token = TokenUtil.newUrlToken();
        u.setEmailVerifyTokenHash(TokenUtil.sha256(token));
        u.setEmailVerifyExpiry(Instant.now().plus(24, ChronoUnit.HOURS));

        String link = mail.frontendUrl()+"/verify?token="+token;
        try {
            mail.send(u.getEmail(), "Confirm your Cinema E-Booking account",
                "Hi "+u.getName()+",\n\nPlease confirm your email by visiting:\n"+link+"\n\nThis link expires in 24 hours.");

            users.save(u);
        } catch (MailException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getLocalizedMessage());
        }

        return ResponseEntity.ok(Map.of("message","Registered. Please check your email to confirm."));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token){
        String h = TokenUtil.sha256(token);
        var u = users.findByEmailVerifyTokenHash(h).orElse(null);
        if (u == null || u.getEmailVerifyExpiry()==null || u.getEmailVerifyExpiry().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body(Map.of("message","Invalid or expired token"));
        }
        u.setEmailVerified(true);
        u.setStatus(User.Status.ACTIVE);
        u.setEmailVerifyTokenHash(null);
        u.setEmailVerifyExpiry(null);
        users.save(u);
        return ResponseEntity.status(302).location(URI.create(mail.frontendUrl()+"/login?verified=1")).build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest body){
        var u = users.findByEmail(body.email.toLowerCase()).orElse(null);
        if (u == null || !u.isEmailVerified() || u.getStatus()!= User.Status.ACTIVE || !encoder.matches(body.password, u.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message","Invalid credentials or account not verified"));
        }
        String token = jwt.issue(u.getEmail(), body.rememberMe, Map.of("role", u.getRole().name(), "name", u.getName()));
        return ResponseEntity.ok(Map.of("token", token, "role", u.getRole().name(), "name", u.getName()));
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestBody @Valid ForgotPasswordRequest body){
        var u = users.findByEmail(body.email.toLowerCase()).orElse(null);
        if (u != null) {
            String token = TokenUtil.newUrlToken();
            u.setResetTokenHash(TokenUtil.sha256(token));
            u.setResetTokenExpiry(Instant.now().plus(2, ChronoUnit.HOURS));
            users.save(u);
            String link = mail.frontendUrl()+"/reset-password?token="+token;
            mail.send(u.getEmail(), "Reset your password", "Reset link (2h):\n"+link);
        }
        return ResponseEntity.ok(Map.of("message","If the email exists, a reset link was sent."));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody @Valid ResetPasswordRequest body){
        var u = users.findByResetTokenHash(TokenUtil.sha256(body.token)).orElse(null);
        if (u==null || u.getResetTokenExpiry()==null || u.getResetTokenExpiry().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body(Map.of("message","Invalid or expired token"));
        }
        u.setPasswordHash(encoder.encode(body.newPassword));
        u.setResetTokenHash(null); u.setResetTokenExpiry(null);
        users.save(u);
        return ResponseEntity.ok(Map.of("message","Password updated. You can now sign in."));
    }
}
