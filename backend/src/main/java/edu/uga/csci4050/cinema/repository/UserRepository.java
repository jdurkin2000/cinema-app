package edu.uga.csci4050.cinema.repository;

import edu.uga.csci4050.cinema.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailVerifyTokenHash(String tokenHash);
    Optional<User> findByResetTokenHash(String tokenHash);
    User findByFirstName(String name);
}
