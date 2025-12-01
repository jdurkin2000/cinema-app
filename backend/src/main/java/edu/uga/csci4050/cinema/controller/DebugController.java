package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Dev-only endpoint to debug JWT acceptance. Do NOT enable in production.
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:3000")
public class DebugController {

    private final JwtService jwt;

    public DebugController(JwtService jwt) {
        this.jwt = jwt;
    }

    @GetMapping("/jwt")
    public ResponseEntity<?> parseJwt(@RequestHeader(name = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Missing Bearer token"));
        }
        String token = auth.substring(7);
        try {
            Jws<Claims> jws = jwt.parse(token);
            Claims c = jws.getBody();
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "subject", c.getSubject(),
                    "role", c.get("role"),
                    "issuedAt", c.getIssuedAt(),
                    "expires", c.getExpiration()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                    "ok", false,
                    "message", "Invalid token",
                    "error", e.getClass().getSimpleName(),
                    "detail", e.getMessage()));
        }
    }
}
