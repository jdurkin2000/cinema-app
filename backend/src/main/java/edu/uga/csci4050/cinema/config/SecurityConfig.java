package edu.uga.csci4050.cinema.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

// --- Spring Security imports that were missing ---
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import edu.uga.csci4050.cinema.security.JwtService;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt) throws Exception {
        return http
                .csrf(cs -> cs.disable())
                .cors(c -> {
                })
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/forgot",
                                "/api/auth/reset")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/verify").permitAll()
                        .requestMatchers("/api/movies/**").permitAll()
                        .requestMatchers("/api/showrooms/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtFilter(jwt), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // CORS for frontend
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }

    static class JwtFilter extends OncePerRequestFilter {
        private final JwtService jwt;

        JwtFilter(JwtService jwt) {
            this.jwt = jwt;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                throws IOException, jakarta.servlet.ServletException {
            String auth = req.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                try {
                    var jws = jwt.parse(auth.substring(7));
                    Claims c = jws.getBody();
                    String email = c.getSubject();
                    String role = (String) c.get("role");
                    var authToken = new UsernamePasswordAuthenticationToken(
                            email, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } catch (Exception ignored) {
                    // invalid token -> remain unauthenticated
                }
            }
            chain.doFilter(req, res);
        }
    }
}
