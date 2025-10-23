package edu.uga.csci4050.cinema.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final long ttlSeconds;
    private final long rememberTtlSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.ttl-seconds}") long ttlSeconds,
            @Value("${app.jwt.rememberme-ttl-seconds}") long rememberTtlSeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.ttlSeconds = ttlSeconds;
        this.rememberTtlSeconds = rememberTtlSeconds;
    }

    public String issue(String subject, boolean remember, Map<String, Object> claims) {
        long ttl = remember ? rememberTtlSeconds : ttlSeconds;
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)
                .addClaims(claims)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(ttl)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String jwt) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt);
    }
}
