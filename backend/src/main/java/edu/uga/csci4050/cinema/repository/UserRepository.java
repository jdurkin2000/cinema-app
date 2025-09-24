package edu.uga.csci4050.cinema.repository;

import edu.uga.csci4050.cinema.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends
        MongoRepository<User, String> {

    User findByName(String name);
}
