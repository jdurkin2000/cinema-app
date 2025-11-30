package edu.uga.csci4050.cinema.controller;

import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.UserRepository;
import edu.uga.csci4050.cinema.service.MailService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final MailService mail;

    public AdminUserController(UserRepository users, PasswordEncoder encoder, MailService mail) {
        this.users = users;
        this.encoder = encoder;
        this.mail = mail;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> listAll() {
        return ResponseEntity.ok(users.findAll());
    }

    public static class CreateAdminRequest {
        @NotBlank
        public String name;
        @Email
        @NotBlank
        public String email;
        @NotBlank
        public String password;
    }

    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminRequest body) {
        if (users.existsByEmail(body.email.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }
        User u = new User();
        u.setName(body.name);
        u.setEmail(body.email.toLowerCase());
        u.setPasswordHash(encoder.encode(body.password));
        u.setRole(User.Role.ADMIN);
        u.setStatus(User.Status.ACTIVE);
        u.setEmailVerified(true);
        users.save(u);
        mail.send(u.getEmail(), "Admin account created", "Your admin account has been created.");
        return ResponseEntity.ok(Map.of("id", u.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> update(@PathVariable String id, @RequestBody Map<String, Object> patch) {
        return users.findById(id).map(u -> {
            if (patch.containsKey("name"))
                u.setName(String.valueOf(patch.get("name")));
            if (patch.containsKey("role")) {
                String r = String.valueOf(patch.get("role")).toUpperCase();
                try {
                    u.setRole(User.Role.valueOf(r));
                } catch (Exception ignored) {
                }
            }
            users.save(u);
            return ResponseEntity.ok(u);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> suspend(@PathVariable String id) {
        return users.findById(id).map(u -> {
            u.setStatus(User.Status.SUSPENDED);
            users.save(u);
            try {
                mail.send(u.getEmail(), "Account suspended", "Your account has been suspended.");
            } catch (Exception ignored) {
            }
            return ResponseEntity.ok(Map.of("message", "Suspended"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/unsuspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unsuspend(@PathVariable String id) {
        return users.findById(id).map(u -> {
            u.setStatus(User.Status.ACTIVE);
            users.save(u);
            return ResponseEntity.ok(Map.of("message", "Unsuspended"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return users.findById(id).map(u -> {
            users.deleteById(id);
            try {
                mail.send(u.getEmail(), "Account deleted", "Your account has been deleted by admin.");
            } catch (Exception ignored) {
            }
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
