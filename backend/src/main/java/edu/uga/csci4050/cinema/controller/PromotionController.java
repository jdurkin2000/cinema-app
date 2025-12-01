package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.controller.dto.PromotionDtos.*;
import edu.uga.csci4050.cinema.model.Promotion;
import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.PromotionRepository;
import edu.uga.csci4050.cinema.repository.UserRepository;
import edu.uga.csci4050.cinema.service.MailService;
import edu.uga.csci4050.cinema.util.DateTimeUtil;
import edu.uga.csci4050.cinema.util.HttpUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "http://localhost:3000")
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

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        List<Promotion> allPromos = promotions.findAll();

        return HttpUtils.buildResponseEntity(allPromos, "No promotions in database");
    }

    /**
     * Validate a promo code and return the promotion if it's currently valid.
     * Example: GET /api/promotions/validate?code=ABC123
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateCode(@RequestParam("code") String code) {
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code is required"));
        }

        Promotion p = promotions.findByCode(code.trim());
        if (p == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Promo not found"));
        }

        Instant now = DateTimeUtil.now();
        if (p.getStartDate() != null && p.getEndDate() != null
                && (now.isBefore(p.getStartDate()) || now.isAfter(p.getEndDate()))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Promo is not currently valid"));
        }

        return ResponseEntity.ok(p);
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
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[PromotionController#create] auth=" + (auth == null ? "null" : auth.getName())
                + ", authorities=" + (auth == null ? "null" : auth.getAuthorities()));
        String code = body.code != null ? body.code.trim() : "";
        if (code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code is required"));
        }
        // Enforce max length of 6 characters for promo codes
        if (code.length() > 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Promo code is too long. Maximum length is 6 characters."));
        }
        if (promotions.existsByCodeIgnoreCase(code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Promo code already exists"));
        }
        if (body.startDate == null || body.endDate == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Start and end date are required"));
        }

        // Parse dates
        Instant startDate;
        Instant endDate;
        try {
            startDate = DateTimeUtil.parseDate(body.startDate);
            endDate = DateTimeUtil.parseDate(body.endDate);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format. Expected: yyyy-MM-dd"));
        }

        if (endDate.isBefore(startDate)) {
            return ResponseEntity.badRequest().body(Map.of("message", "End date must be on or after start date"));
        }
        if (DateTimeUtil.isDateBeforeToday(endDate)) {
            return ResponseEntity.badRequest().body(Map.of("message", "End date cannot be in the past"));
        }

        Promotion p = new Promotion();
        p.setCode(code);
        p.setStartDate(startDate);
        p.setEndDate(endDate);
        p.setDiscountPercent(body.discountPercent);

        Promotion saved = promotions.save(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Email the promotion to subscribed users only (promotionsOptIn = true).
     */
    @PostMapping("/{promotionId}/send")
    public ResponseEntity<?> sendPromotion(@PathVariable String promotionId) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[PromotionController#send] auth=" + (auth == null ? "null" : auth.getName())
                + ", authorities=" + (auth == null ? "null" : auth.getAuthorities()));
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
            if (email == null || email.isBlank())
                continue;

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
                "emailsSent", sent));
    }

    private String buildEmailBody(User u, Promotion p) {
        String name = (u.getName() != null && !u.getName().isBlank())
                ? u.getName()
                : "there";
        return "Hi " + name + ",\n\n" +
                "Here's a new promotion just for our subscribers!\n\n" +
                "Promo code: " + p.getCode() + "\n" +
                "Discount: " + p.getDiscountPercent() + "%\n" +
                "Valid from " + DateTimeUtil.formatDate(p.getStartDate()) +
                " to " + DateTimeUtil.formatDate(p.getEndDate()) + ".\n\n" +
                "See you at the cinema!\n";
    }
}
