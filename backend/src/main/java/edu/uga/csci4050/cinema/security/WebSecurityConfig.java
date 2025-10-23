package edu.uga.csci4050.cinema.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.List;

@Configuration
public class WebSecurityConfig {

    @Bean public PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt) throws Exception {
        return http
            .csrf(cs -> cs.disable())
            .cors(c -> {})
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/auth/register","/api/auth/login","/api/auth/forgot","/api/auth/reset").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/verify").permitAll()
                .requestMatchers("/api/movies/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtFilter(jwt), UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    // CORS for frontend
    @Bean public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                        .allowCredentials(true);
            }
        };
    }

    static class JwtFilter extends OncePerRequestFilter {
        private final JwtService jwt;
        JwtFilter(JwtService jwt){ this.jwt = jwt; }

        @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                throws IOException, jakarta.servlet.ServletException {
            String auth = req.getHeader("Authorization");
            if(auth != null && auth.startsWith("Bearer ")) {
                try {
                    var jws = jwt.parse(auth.substring(7));
                    Claims c = jws.getBody();
                    String email = c.getSubject();
                    String role = (String)c.get("role");
                    var authToken = new UsernamePasswordAuthenticationToken(
                            email, null, List.of(new SimpleGrantedAuthority("ROLE_"+role)));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } catch (Exception ignored) { /* invalid token -> unauthenticated */ }
            }
            chain.doFilter(req, res);
        }
    }
}
