package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.controller.dto.PromotionDtos.*;
import edu.uga.csci4050.cinema.model.Promotion;
import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.PromotionRepository;
import edu.uga.csci4050.cinema.repository.UserRepository;
import edu.uga.csci4050.cinema.service.MailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionRepository promotions;
    private final UserRepository users;
    private final MailService mail;

    public PromotionController(PromotionRepository promotions,
                               UserRepository users,
                               MailService mail) {
        this.promotions = promotions;
        this.users = users;
        this.mail = mail;
    }

    /**
     * Create a new promotion.
     * Validates:
     * - promo code present & unique
     * - startDate & endDate present
     * - endDate on/after startDate
     * - endDate not in the past
     * - discountPercent between 1 and 100
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid CreatePromotionRequest body) {
        String code = body.code != null ? body.code.trim() : "";
        if (code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code is required"));
        }
        if (promotions.existsByCodeIgnoreCase(code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code already exists"));
        }
        if (body.startDate == null || body.endDate == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Start and end date are required"));
        }
        if (body.endDate.isBefore(body.startDate)) {
            return ResponseEntity.badRequest().body(Map.of("message", "End date must be on or after start date"));
        }
        if (body.endDate.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "End date cannot be in the past"));
        }
        if (body.discountPercent < 1 || body.discountPercent > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Discount percent must be between 1 and 100"));
        }

        Promotion p = new Promotion();
        p.setCode(code);
        p.setStartDate(body.startDate);
        p.setEndDate(body.endDate);
        p.setDiscountPercent(body.discountPercent);

        Promotion saved = promotions.save(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Email the promotion to subscribed users only (promotionsOptIn = true).
     */
    @PostMapping("/{promotionId}/send")
    public ResponseEntity<?> sendPromotion(@PathVariable String promotionId) {
        var promoOpt = promotions.findById(promotionId);
        var promo = promoOpt.orElse(null);
        if (promo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Promotion not found"));
        }

        List<User> subscribed = users.findByPromotionsOptInTrue();
        int sent = 0;

        for (User u : subscribed) {
            String email = u.getEmail();
            if (email == null || email.isBlank()) continue;

            String subject = "Cinema promotion: " + promo.getCode();
            String body = buildEmailBody(u, promo);
            try {
                mail.send(email, subject, body);
                sent++;
            } catch (MailException ignored) {
                // For the assignment, skip failures silently
            }
        }

        return ResponseEntity.ok(Map.of(
                "promotionId", promotionId,
                "emailsSent", sent
        ));
    }

    private String buildEmailBody(User u, Promotion p) {
        String name = (u.getName() != null && !u.getName().isBlank())
                ? u.getName()
                : "there";
        return "Hi " + name + ",\n\n" +
                "Here's a new promotion just for our subscribers!\n\n" +
                "Promo code: " + p.getCode() + "\n" +
                "Discount: " + p.getDiscountPercent() + "%\n" +
                "Valid from " + p.getStartDate() + " to " + p.getEndDate() + ".\n\n" +
                "See you at the cinema!\n";
    }
}
