package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.controller.dto.ProfileDtos.*;
import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.UserRepository;
import edu.uga.csci4050.cinema.security.CryptoService;
import edu.uga.csci4050.cinema.service.MailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import edu.uga.csci4050.cinema.controller.dto.ProfileDtos;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final CryptoService crypto;
    private final MailService mail;

    public ProfileController(UserRepository users, PasswordEncoder encoder, CryptoService crypto, MailService mail) {
        this.users=users; this.encoder=encoder; this.crypto=crypto; this.mail=mail;
    }

    private Optional<User> me(Authentication a){ return users.findByEmail(a.getName()); }

    @GetMapping
    public ResponseEntity<?> get(Authentication auth){
        var u = me(auth).orElse(null);
    if (u == null) return ResponseEntity.status(401).build();

    Map<String, Object> resp = new HashMap<>();
    resp.put("email", u.getEmail());
    resp.put("name", u.getName());
    resp.put("role", u.getRole() != null ? u.getRole().name() : "USER");
    resp.put("promotionsOptIn", u.isPromotionsOptIn());
    resp.put("address", u.getAddress() != null ? u.getAddress() : Map.of());

    List<Map<String, Object>> cards = u.getPaymentCards().stream().map(c -> {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId() != null ? c.getId() : "");
        m.put("brand", c.getBrand() != null ? c.getBrand() : "");
        m.put("last4", c.getLast4() != null ? c.getLast4() : "");
        m.put("expMonth", c.getExpMonth());
        m.put("expYear", c.getExpYear());
        m.put("billingName", c.getBillingName() != null ? c.getBillingName() : "");
        m.put("billingAddress", c.getBillingAddress() != null ? c.getBillingAddress() : Map.of());
        return m;
    }).toList();

    resp.put("paymentCards", cards);

    return ResponseEntity.ok(resp);
    }

    @PutMapping
    public ResponseEntity<?> update(Authentication auth, @RequestBody @Valid UpdateProfileRequest body){
        var u = me(auth).orElse(null);
        if (u==null) return ResponseEntity.status(401).build();
        boolean changed = false;
        if (body.firstLastName != null && !body.firstLastName.isBlank()){ u.setName(body.firstLastName); changed=true; }
        if (body.promotionsOptIn != null){ u.setPromotionsOptIn(body.promotionsOptIn); changed=true; }
        if (body.address != null){ u.setAddress(body.address); changed=true; }
        if (changed){ users.save(u); mail.send(u.getEmail(), "Your profile was changed", "We noticed profile info was updated."); }
        return ResponseEntity.ok(Map.of("message","Updated"));
    }

    @PostMapping("/password")
    public ResponseEntity<?> changePassword(Authentication auth, @RequestBody @Valid ChangePasswordRequest body){
        var u = me(auth).orElse(null);
        if (u==null) return ResponseEntity.status(401).build();
        if (!encoder.matches(body.currentPassword, u.getPasswordHash())){
            return ResponseEntity.status(400).body(Map.of("message","Current password incorrect"));
        }
        u.setPasswordHash(encoder.encode(body.newPassword));
        users.save(u);
        mail.send(u.getEmail(), "Your password was changed", "If this wasn't you, reset it now.");
        return ResponseEntity.ok(Map.of("message","Password changed"));
    }

    @PostMapping("/cards")
    public ResponseEntity<?> addCard(Authentication auth, @RequestBody @Valid AddCardRequest body){
        var u = me(auth).orElse(null);
        if (u==null) return ResponseEntity.status(401).build();
        if (u.getPaymentCards().size() >= 4){
            return ResponseEntity.badRequest().body(Map.of("message","Maximum 4 cards allowed"));
        }
        var card = new User.PaymentCard();
        card.setId(ProfileDtos.newCardId());
        String pan = body.number.replaceAll("\\s","");
        if (pan.length() < 12 || pan.length() > 19) return ResponseEntity.badRequest().body(Map.of("message","Invalid card number"));
        card.setLast4(pan.substring(pan.length()-4));
        card.setBrand(brandOf(pan));
        card.setExpMonth(body.expMonth);
        card.setExpYear(body.expYear);
        card.setBillingName(body.billingName);
        card.setBillingAddress(body.billingAddress);
        card.setNumberEnc(crypto.encrypt(pan));
        u.getPaymentCards().add(card);
        users.save(u);
        return ResponseEntity.ok(Map.of("id", card.getId(), "brand", card.getBrand(), "last4", card.getLast4()));
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<?> removeCard(Authentication auth, @PathVariable String cardId){
        var u = me(auth).orElse(null);
        if (u==null) return ResponseEntity.status(401).build();
        boolean removed = u.getPaymentCards().removeIf(c -> c.getId().equals(cardId));
        if (!removed) return ResponseEntity.badRequest().body(Map.of("message","Card not found"));
        users.save(u);
        return ResponseEntity.ok(Map.of("message","Removed"));
    }

    private String brandOf(String pan){
        if (pan.startsWith("4")) return "Visa";
        if (pan.matches("^5[1-5].*")) return "Mastercard";
        if (pan.matches("^3[47].*")) return "Amex";
        return "Card";
    }

    @PutMapping("/cards/{cardId}")
    public ResponseEntity<?> updateCard(
            Authentication auth,
            @PathVariable String cardId,
            @RequestBody @Valid UpdateCardRequest body) {

        var u = me(auth).orElse(null);
        if (u == null) return ResponseEntity.status(401).build();

        var cardOpt = u.getPaymentCards().stream()
                        .filter(c -> c.getId().equals(cardId))
                        .findFirst();

        if (cardOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Card not found"));
        }

        var card = cardOpt.get();
        boolean changed = false;

        // Update billing name
        if (body.billingName != null && !body.billingName.isBlank()) {
            card.setBillingName(body.billingName);
            changed = true;
        }

        // Update billing address
        if (body.billingAddress != null) {
            card.setBillingAddress(body.billingAddress);
            changed = true;
        }

        // Update expiration month
        if (body.expMonth != null) {
            if (body.expMonth < 1 || body.expMonth > 12) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid expiration month"));
            }
            card.setExpMonth(body.expMonth);
            changed = true;
        }

        // Update expiration year
        if (body.expYear != null) {
            int currentYear = java.time.Year.now().getValue();
            if (body.expYear < currentYear) {
                return ResponseEntity.badRequest().body(Map.of("message", "Expiration year cannot be in the past"));
            }
            card.setExpYear(body.expYear);
            changed = true;
        }

        if (changed) {
            users.save(u);
            mail.send(u.getEmail(), "Payment card updated", 
                    "Your payment card ending with " + card.getLast4() + " was updated.");
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", card.getId());
        resp.put("brand", card.getBrand());
        resp.put("last4", card.getLast4());
        resp.put("billingName", card.getBillingName());
        resp.put("billingAddress", card.getBillingAddress());
        resp.put("expMonth", card.getExpMonth());
        resp.put("expYear", card.getExpYear());

        return ResponseEntity.ok(resp);
    }

    // DTO for update request
    public static class UpdateCardRequest {
        @NotBlank
        public String id; // The card ID to update
        public String billingName;
        public Map<String, String> billingAddress;
        public Integer expMonth;
        public Integer expYear;
    }

}
