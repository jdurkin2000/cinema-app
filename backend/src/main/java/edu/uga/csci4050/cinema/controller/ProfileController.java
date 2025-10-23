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
        if (u==null) return ResponseEntity.status(401).build();
        // mask cards (no PAN)
        return ResponseEntity.ok(Map.of(
                "email", u.getEmail(),
                "name", u.getName(),
                "role", u.getRole().name(),
                "promotionsOptIn", u.isPromotionsOptIn(),
                "address", u.getAddress(),
                "paymentCards", u.getPaymentCards().stream().map(c -> Map.of(
                        "id", c.getId(), "brand", c.getBrand(), "last4", c.getLast4(),
                        "expMonth", c.getExpMonth(), "expYear", c.getExpYear(),
                        "billingName", c.getBillingName(), "billingAddress", c.getBillingAddress()
                )).toList()
        ));
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
}
