package edu.uga.csci4050.cinema.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import edu.uga.csci4050.cinema.security.JwtService;

import java.io.IOException;
import java.util.List;

/**
 * Security configuration for the cinema application.
 * 
 * Key improvements:
 * - Stateless session management (JWT-based)
 * - Clear separation of public and protected endpoints
 * - CORS configuration with specific origins
 * - Method-level security enabled
 * - CSRF disabled for API (using JWT tokens)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Increased strength
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt) throws Exception {
        return http
                // CSRF disabled for stateless API (JWT-based authentication)
                .csrf(csrf -> csrf.disable())

                // Enable CORS with configuration from corsConfigurer()
                .cors(cors -> {
                })

                // Stateless session management (no server-side sessions)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/forgot",
                                "/api/auth/reset")
                        .permitAll()

                        // Public verification endpoint
                        .requestMatchers(HttpMethod.GET, "/api/auth/verify").permitAll()

                        // Public movie browsing (read-only)
                        .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()

                        // Movie management requires authentication (handled by @PreAuthorize)
                        .requestMatchers(HttpMethod.POST, "/api/movies/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/movies/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/movies/**").authenticated()

                        // Public showroom/showtime browsing (read-only)
                        .requestMatchers(HttpMethod.GET, "/api/showrooms/**").permitAll()

                        // Showroom management requires authentication
                        .requestMatchers("/api/showrooms/**").authenticated()

                        // Public promotion validation
                        .requestMatchers(HttpMethod.GET, "/api/promotions/validate").permitAll()

                        // Promotion management requires authentication
                        .requestMatchers("/api/promotions/**").authenticated()

                        // Bookings require authentication
                        .requestMatchers("/api/bookings/**").authenticated()

                        // Profile management requires authentication
                        .requestMatchers("/api/profile/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated())

                // Add JWT filter before Spring Security's authentication filter
                .addFilterBefore(new JwtFilter(jwt), UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    /**
     * CORS configuration for frontend
     * Allows specific origins, methods, and credentials
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(allowedOrigins.split(","))
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600); // Cache preflight requests for 1 hour
            }
        };
    }

    /**
     * JWT authentication filter
     * Validates JWT tokens and sets authentication context
     */
    static class JwtFilter extends OncePerRequestFilter {
        private final JwtService jwt;

        JwtFilter(JwtService jwt) {
            this.jwt = jwt;
        }

        @Override
        protected void doFilterInternal(@NonNull HttpServletRequest req, @NonNull HttpServletResponse res,
                @NonNull FilterChain chain)
                throws IOException, jakarta.servlet.ServletException {
            String auth = req.getHeader("Authorization");

            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                try {
                    var jws = jwt.parse(token);
                    Claims claims = jws.getBody();

                    String email = claims.getSubject();
                    String role = (String) claims.get("role");

                    if (email != null && role != null) {
                        var authToken = new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (Exception e) {
                    // Invalid token - remain unauthenticated
                    // You could log this for security monitoring
                    SecurityContextHolder.clearContext();
                }
            }

            chain.doFilter(req, res);
        }
    }
}
